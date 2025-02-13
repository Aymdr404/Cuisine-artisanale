import React, { useEffect, useState } from 'react';
import './RecetteDesc.css';

import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc, onSnapshot } from '@firebase/firestore';
import { db } from '../../firebase';
import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { toggleLikeRecipes, unlikeRecipes } from '@/services/RecetteService/RecetteService';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';


interface Recette{
  id: string;
  title: string;
  description: string;
  type: string;
  cookingTime: number;
  preparationTime: number;
  ingredients: string[];
  video: string;
  steps: string[];
  position: string;
}

const RecetteDesc: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {role, user} = useAuth();
  const [likes, setLikes] = useState<string[]>([]);
  const userId = user?.uid;

  const hasLiked = userId ? likes.includes(userId) : false;
  const [recette, setRecette] = React.useState<Recette | null>(null);



  const getRecette = async(id:string) => {
    const recetteRef = doc(db, 'recipes', id!);

    try {
      const recetteSnap = await getDoc(recetteRef);
      
      if (recetteSnap.exists()) {
        setRecette(recetteSnap.data() as Recette);
        return recetteSnap.data();  // Retourne les données du document
      } else {
        console.log("Pas de recette trouvée avec cet ID");
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la recette :", error);
    }
  }

  useEffect(() => {
    getRecette(id!);

    const unsubscribe = onSnapshot(doc(db, "recipes", id!), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setLikes(docSnapshot.data().likes || []);
      }
    });

    return () => unsubscribe();    
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
          <section className='button-container-right'>
            <Button onClick={() => navigate('/recettes')}>Retour</Button>
            {role === 'admin' && (
              <div>
                <ConfirmDialog />
                <Button onClick={confirmDelete}>Supprimer</Button>
              </div>
            )}
          </section>
          <section className='button-container-left'>
            <Button label={hasLiked ? `❤️` : `🤍`} onClick={handleLike} severity={hasLiked ? "danger" : "secondary"} ></Button>
          </section>
        </section>
        <h1 className="recette-title">{recette.title}</h1>
        <section className='recette-description'>
          <section className='recette-info'>
            
            <div className="recette-info">
              <p><strong>Type :</strong> {recette.type}</p>
            </div>

            {recette.position &&(
              <div className='recette-position'>
                <p><strong>Position:</strong>{recette.position}</p>
              </div>
            )}

            <div className="recette-ingredients">
              <h3>Ingrédients</h3>
              <ul>
                {recette.ingredients.map((ingredient, index) => (
                  <li key={index}><p>{ingredient}</p></li>
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
