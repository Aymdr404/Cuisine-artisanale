import React, { useEffect, useState } from 'react';
import './Recette.css';

import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext/AuthContext';

import { toggleLikeRecipes, unlikeRecipes } from '@/services/RecetteService/RecetteService';
import { doc, onSnapshot } from '@firebase/firestore';
import { db } from '../../firebase';

interface RecetteProps {
  recetteId: string;
  title: string;
  description: string;
  type: string;
}

const Recette: React.FC<RecetteProps> = ({recetteId, title, description, type}) => {

  const { user } = useAuth();
  const [likes, setLikes] = useState<string[]>([]);
  const userId = user?.uid;
  const hasLiked = userId ? likes.includes(userId) : false;

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "recipes", recetteId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setLikes(docSnapshot.data().likes || []);
      }
    });

    return () => unsubscribe();
  }, [recetteId]);

  const handleLike = async () => {
    if (!userId) return alert("You must be logged in to like a post!");
    if (hasLiked) {
      await unlikeRecipes(recetteId, userId);
    } else {
      await toggleLikeRecipes(recetteId, userId);
    }
  };
  
  return (
    <div className="Recette">
      <section className="Recette_header">
        <h1>{title}</h1>
        <Button className='Recette_likeButton'
          label={hasLiked ? `❤️ ${likes.length}` : `🤍 ${likes.length}`}
          onClick={handleLike}
          severity={hasLiked ? "danger" : "secondary"}
        />
      </section>
      
      <p>{description}</p>
      <p>{type}</p>

      {/* Ajout des images quand j'aurais */}

      <Link to={`/recettes/${recetteId}`}>
        <Button>Voir la recette</Button>
      </Link>
    </div>
  );
};

export default Recette;
