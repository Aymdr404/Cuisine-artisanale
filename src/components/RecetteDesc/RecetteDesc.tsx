import React, { useEffect, useState, useRef } from 'react';
import './RecetteDesc.css';
import VideoEmbed from '@components/VideoEmbed/VideoEmbed';

import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc, onSnapshot, query, where, getDocs, collection } from '@firebase/firestore';
import { db } from '@firebaseModule';
import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { toggleLikeRecipes, unlikeRecipes } from '@/services/RecetteService/RecetteService';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { useToast } from '@/contexts/ToastContext/ToastContext';

interface RecipePart {
  title: string;
  steps: string[];
  ingredients: Ingredient[];
}

interface Recette {
  id: string;
  title: string;
  type: string;
  cookingTime: number;
  preparationTime: number;
  recipeParts: RecipePart[];
  video?: string;
  position: string;
  images?: string[];
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

const RecetteDesc: React.FC = () => {
  const [id, setId] = useState<string | null>(null);
  const { recipeName } = useParams();
  const navigate = useNavigate();
  const {role, user} = useAuth();
  const { showToast } = useToast();
  const [likes, setLikes] = useState<string[]>([]);
  const userId = user?.uid;

  const hasLiked = userId ? likes.includes(userId) : false;
  const [recette, setRecette] = React.useState<Recette | null>(null);
  const [departements, setDepartements] = useState<Map<string, string>>(new Map());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRecette = async (recipeName: string) => {
    const recettesCollection = collection(db, "recipes");
    const q = query(recettesCollection, where("url", "==", recipeName));
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("Pas de recette trouvée avec ce nom");
        return;
      }

      const recetteDoc = querySnapshot.docs[0];
      const recetteData = recetteDoc.data() as Recette;
      setId(recetteDoc.id);

      // Traitement des ingrédients pour chaque partie
      const updatedRecipeParts = await Promise.all(
        recetteData.recipeParts.map(async (part) => {
          const ingredientsDetails = await Promise.all(
            part.ingredients.map(async (ingredient) => {
              const ingredientRef = doc(db, 'ingredients', ingredient.id);
              const ingredientSnap = await getDoc(ingredientRef);

              if (ingredientSnap.exists()) {
                const ingredientData = ingredientSnap.data();
                return {
                  id: ingredient.id,
                  name: ingredientData.name,
                  quantity: ingredient.quantity,
                  unit: ingredientData.unit,
                };
              } else {
                console.warn(`Ingrédient avec l'ID ${ingredient.id} introuvable`);
                return null;
              }
            })
          );

          const filteredIngredients = ingredientsDetails.filter((ing) => ing !== null);
          return {
            ...part,
            ingredients: filteredIngredients
          };
        })
      );

      setRecette({ ...recetteData, recipeParts: updatedRecipeParts });
    } catch (error) {
      console.error("Erreur lors de la récupération de la recette :", error);
    }
  };

  useEffect(() => {
    if (recipeName){
      getRecette(recipeName);
    }
  }, [recipeName]);

  useEffect(() => {
    fetch("https://geo.api.gouv.fr/departements")
      .then(res => res.json())
      .then(data => {
        const departementMap: Map<string, string> = new Map(data.map((dep: { code: string; nom: string }) => [dep.code, dep.nom]));
        setDepartements(departementMap);
      });
  }, []);


  useEffect(() => {
    if (id) {
      const unsubscribe = onSnapshot(doc(db, "recipes", id), (docSnapshot) => {
        if (docSnapshot.exists()) {
          setLikes(docSnapshot.data().likes || []);
        }
      });

      return () => unsubscribe();
    }
  }, [id]);

  useEffect(() => {
    if (recette?.images && recette.images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === (recette?.images?.length ?? 0) - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recette?.images]);

  useEffect(() => {
	if (!recette) return;

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "Recipe",
		"name": recette.title,
		"image": recette.images?.[0] || "",
		"author": {
		"@type": "Person",
		"name": user?.displayName || "Auteur inconnu"
		},
		"recipeCuisine": departements.get(recette.position) || "France",
		"recipeCategory": recette.type,
		"prepTime": `PT${recette.preparationTime}M`,
		"cookTime": `PT${recette.cookingTime}M`,
		"recipeIngredient": recette.recipeParts.flatMap(part =>
		part.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`)
		),
		"recipeInstructions": recette.recipeParts.flatMap(part =>
		part.steps.map(step => ({
			"@type": "HowToStep",
			"text": step
		}))
		),
		"video": recette.video
		? {
			"@type": "VideoObject",
			"name": recette.title,
			"description": `Vidéo de la recette ${recette.title}`,
			"thumbnailUrl": recette.images?.[0] || "",
			"uploadDate": new Date().toISOString(),
			"contentUrl": recette.video
			}
		: undefined
	};

	// Supprime tout ancien script JSON-LD
	const oldScript = document.getElementById("jsonld-recipe");
	if (oldScript) oldScript.remove();

	// Crée et insère le nouveau script
	const script = document.createElement("script");
	script.id = "jsonld-recipe";
	script.type = "application/ld+json";
	script.innerHTML = JSON.stringify(structuredData);
	document.head.appendChild(script);

	return () => {
		const existing = document.getElementById("jsonld-recipe");
		if (existing) existing.remove();
	};
	}, [recette, departements]);


  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, "recipes", id));
      showToast({
        severity: 'success',
        summary: 'Succès',
        detail: 'Recette supprimée avec succès'
      });
      navigate('/recettes');
    } catch (error) {
      console.error("Erreur lors de la suppression de la recette :", error);
      showToast({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la suppression de la recette'
      });
    }
  };

  const confirmDelete = () => {
    confirmDialog({
      message: 'Êtes-vous sûr de vouloir supprimer cette recette ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: handleDelete,
      reject: () => {}
    });
  };

  const handleLike = async () => {
    if (!userId) {
      showToast({
        severity: 'warn',
        summary: 'Connexion requise',
        detail: 'Vous devez être connecté pour aimer une recette'
      });
      return;
    }
    if (!id) {
      showToast({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de trouver la recette'
      });
      return;
    }
    try {
      if (hasLiked) {
        await unlikeRecipes(id, userId);
      } else {
        await toggleLikeRecipes(id, userId);
      }
    } catch (error) {
      console.error("Erreur lors du like:", error);
      showToast({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors du like'
      });
    }
  };

  return (
    <div className="RecetteDesc">
      <ConfirmDialog />
      <div className="recette-desc-button-container">
        <div className="recette-desc-button-container-left">
          <Button
            icon="pi pi-arrow-left"
            onClick={() => navigate(-1)}
            className="p-button-text"
          />
          <Button
            icon="pi pi-home"
            onClick={() => navigate("/")}
            className="p-button-text"
          />
          <Button
            icon={hasLiked ? 'pi pi-heart-fill' : 'pi pi-heart'}
            onClick={handleLike}
            className="p-button-text"
            severity={hasLiked ? 'danger' : 'info'}
          />
        </div>
        {role === 'admin' && (
          <div className="recette-desc-admin-buttons">
            <Button
              icon="pi pi-pencil"
              onClick={() => navigate(`/recettes/${id}/edit`)}
              className="p-button-text"
            />
            <Button
              icon="pi pi-trash"
              onClick={confirmDelete}
              className="p-button-text p-button-danger"
            />
          </div>
        )}
      </div>

      <h1 className="recette-desc-title">{recette?.title}</h1>

      <div className="recette-desc-description">
        <div className="recette-desc-info">
          <div className="recette-desc-info-left">
            <p>
              <strong>Type:</strong> {recette?.type}
            </p>
            {recette?.position && (
              <div className="recette-desc-position">
                <p>
                  <strong>Departement:</strong> {departements.get(recette.position) || "Inconnu"}
                </p>
              </div>
            )}
            <div className="recette-desc-timing">
              <p>
                <i className="pi pi-clock"></i>
                <strong>Temps de préparation:</strong> {recette?.preparationTime} min
              </p>
              <p>
                <i className="pi pi-hourglass"></i>
                <strong>Temps de cuisson:</strong> {recette?.cookingTime} min
              </p>
            </div>
            {recette?.video && (
              <h3 className='recette-desc-video'>
                <strong>Vidéo associée :</strong>
                <VideoEmbed url={recette.video} />
              </h3>
            )}
          </div>
          <div className="recette-desc-info-right">
            {recette?.images && recette.images.length > 0 && (
              <div className="recette-desc-gallery">
                <div className="recette-desc-main-image">
                  <img
                    src={recette.images[currentImageIndex]}
                    alt={`${recette.title} - Image ${currentImageIndex + 1}`}
                  />
                </div>
                {recette.images.length > 1 && (
                  <div className="recette-desc-thumbnails">
                    {recette.images.map((image, index) => (
                      <div
                        key={index}
                        className={`recette-desc-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => handleImageClick(index)}
                      >
                        <img
                          src={image}
                          alt={`${recette.title} - Thumbnail ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {recette?.recipeParts.map((part, index) => (
          <div key={index} className="recette-desc-part">
            <h2>{part.title}</h2>
            <section>
              <div className="recette-desc-part-ingredients">
                <h3>Ingrédients</h3>
                <ul>
                  {part.ingredients.map((ingredient, idx) => (
                    <li key={idx}>
                      <p>
                        {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="recette-desc-part-steps">
                <h3>Étapes de préparation</h3>
                <ol>
                  {part.steps.map((step, idx) => (
                    <li key={idx}>
                      <h4>{step}</h4>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>
        ))}


      </div>
    </div>
  );
};

export default RecetteDesc;
