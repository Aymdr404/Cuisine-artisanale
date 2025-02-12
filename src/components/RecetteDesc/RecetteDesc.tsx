import React, { useEffect } from 'react';
import './RecetteDesc.css';

import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from '@firebase/firestore';
import { db } from '../../firebase';
import { Button } from 'primereact/button';


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

  return (
    <div className="RecetteDesc">
      {recette ? (
        <>
        <section className='button-container'>
          <Button onClick={() => navigate('/recettes')}>Retour</Button>
          <section className='button-container-right'>
            <Button>Liker</Button>
            <Button onClick={() => suppRecette(recette.id)}>Supprimer</Button>
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
