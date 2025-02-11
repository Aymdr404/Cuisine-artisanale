import React, { useEffect } from 'react';
import './RecetteDesc.css';

import { useParams } from 'react-router-dom';
import { doc, getDoc } from '@firebase/firestore';
import { db } from '../../firebase';


interface Recette{
  id: number;
  title: string;
  description: string;
  type: string;
  cookingTime: number;
  preparationTime: number;
  ingredients: string[];
  video: string;
}

const RecetteDesc: React.FC = () => {
  const { id } = useParams();

  const [recette, setRecette] = React.useState<Recette | null>(null);

  const getRecette = async(id:string) => {
    const recetteRef = doc(db, 'recipes', id!);

    try {
      const recetteSnap = await getDoc(recetteRef);
      
      if (recetteSnap.exists()) {
        console.log('Recette:', recetteSnap.data());
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

  return (
    <div className="RecetteDesc">
      {recette ? (
        <>
          <h1 className="recette-title">{recette.title}</h1>
          
          <div className="recette-info">
            <p className="recette-description">{recette.description}</p>
            <p><strong>Type :</strong> {recette.type}</p>
            <p><strong>Temps de préparation :</strong> {recette.preparationTime} minutes</p>
            <p><strong>Temps de cuisson :</strong> {recette.cookingTime} minutes</p>
          </div>

          <div className="recette-ingredients">
            <h3>Ingrédients</h3>
            <ul>
              {recette.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          {recette.video && (
            <div className="recette-video">
              <h3>Vidéo</h3>
              <a href={recette.video} target="_blank" rel="noopener noreferrer">Voir la vidéo</a>
            </div>
          )}
        </>
      ) : (
        <p>Chargement...</p>
      )}
    </div>

  );
};

export default RecetteDesc;
