import React, { useEffect, useState } from 'react';
import './RecetteDesc.css';

import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc, onSnapshot, query, where, getDocs, collection } from '@firebase/firestore';
import { db } from '@firebaseModule';
import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { toggleLikeRecipes, unlikeRecipes } from '@/services/RecetteService/RecetteService';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';


interface Recette{
  id: string;
  title: string;
  type: string;
  cookingTime: number;
  preparationTime: number;
  ingredients: Ingredient[];
  video: string;
  steps: string[];
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
  const [likes, setLikes] = useState<string[]>([]);
  const userId = user?.uid;

  const hasLiked = userId ? likes.includes(userId) : false;
  const [recette, setRecette] = React.useState<Recette | null>(null);
  const [departements, setDepartements] = useState<Map<string, string>>(new Map());


  const getRecette = async (recipeName: string) => {
  
    const recettesCollection = collection(db, "recipes");
    const q = query(recettesCollection, where("url", "==", recipeName));
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("Pas de recette trouvée avec ce nom");
        return;
      }

      const recetteDoc = querySnapshot.docs[0]
      const recetteData = recetteDoc.data() as Recette;
      setId(recetteDoc.id);

      const ingredientsDetails = await Promise.all(
        recetteData.ingredients.map(async (ingredient) => {
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
  
      setRecette({ ...recetteData, ingredients: filteredIngredients });
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
  
  const suppRecette = async(id:string) => {
    if (!id) {
      console.error("ID de la recette manquant !");
      return;
    }

  try {
    await deleteDoc(doc(db, "recipes", id));
    navigate('/recettes');
    } catch (error) {
      console.error("Erreur lors de la suppression de la recette :", error);
    }
  }

  const handleLike = async () => {
    if (!userId) return alert("You must be logged in to like a post!");
    if (hasLiked) {
      await unlikeRecipes(recette!.id, userId);
    } else {
      await toggleLikeRecipes(recette!.id, userId);
    }
  };

  const confirmDelete = () => {
    confirmDialog({
          message: 'Do you want to delete this record?',
          header: 'Delete Confirmation',
          icon: 'pi pi-info-circle',
          defaultFocus: 'reject',
          acceptClassName: 'p-button-danger',
          accept: () => suppRecette(id!),
      });
  };

  return (
    <div className="RecetteDesc">
      {recette ? (
        <>
        <section className='button-container'>
          <section className='button-container-left'>
            <Button onClick={() => navigate('/recettes')}>Retour</Button>
            {role === 'admin' && (
              <div className='admin-buttons'>
                <Button onClick={() => navigate(`/recettes/${id}/edit`)}>Modifier</Button>

                <ConfirmDialog />
                <Button onClick={confirmDelete}>Supprimer</Button>
              </div>
            )}
          </section>

          <section className='button-container-right'>
            <Button label={hasLiked ? `❤️` : `🤍`} onClick={handleLike} severity={hasLiked ? "danger" : "secondary"} ></Button>
          </section>
        </section>
        <h1 className="recette-title">{recette.title}</h1>
        <section className='recette-description'>
          <section className='recette-info'>
            
            <div className="recette-info">
              <p><strong>Type: </strong> {recette.type}</p>
            </div>

            {recette.position &&(
              <div className='recette-position'>
                <p><strong>Departement: </strong>{departements.get(recette.position) || "Inconnu"}</p>
              </div>
            )}
            {recette.images && recette.images.length > 0 && (
              <section className="recette-images">
                {recette.images.length === 0 && <p>No images</p>}
                {recette.images.map((image, index) => (
                  <img key={index} src={image} alt="recette" />
                ))}
              </section>
            )}
            <div className="recette-ingredients">
              <h3>Ingrédients</h3>
              <ul>
              {recette.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {typeof ingredient === "string" ? (
                    <p>{ingredient}</p>
                  ) : (
                    <p>{ingredient.name} - {ingredient.quantity} {ingredient.unit}</p>
                  )}
                </li>
              ))}
              </ul>
            </div>
          </section>
          <section className='recette-steps'>
            <div className='recette_timing'>
              <p><strong>Temps de préparation :</strong> {recette.preparationTime} minutes</p>
              <p><strong>Temps de cuisson :</strong> {recette.cookingTime} minutes</p>
            </div>
            <h2>Étapes de préparation:</h2>
            <ol>
              {recette.steps.map((step, index) => (
                <li key={index}>
                  <h3>Étape {index + 1}:</h3>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
          {recette.video && (
            <div className="recette-video">
              <h3>Vidéo</h3>
              <a href={recette.video} target="_blank" rel="noopener noreferrer">Voir la vidéo</a>
            </div>
          )}

        </section>
        </>
      ) : (
        <p>Chargement...</p>
      )}
    </div>

  );
};

export default RecetteDesc;
