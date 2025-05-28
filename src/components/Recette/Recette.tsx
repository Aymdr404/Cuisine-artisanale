import React, { useEffect, useState } from 'react';
import './Recette.css';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { toggleLikeRecipes, unlikeRecipes } from '@/services/RecetteService/RecetteService';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot } from '@firebase/firestore';
import { db } from '@firebaseModule';

interface RecetteProps {
  recetteId: string;
  title: string;
  type: string;
  fromRequest?: boolean;
  images?: string[];
  position?: string;
}

export const Recette: React.FC<RecetteProps> = ({
  recetteId,
  title,
  type,
  fromRequest = false,
  images = [],
  position = ''
}) => {
  const { user, role } = useAuth();
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
    if (!userId) {
      return alert("Vous devez être connecté pour aimer une recette!");
    }
    if (hasLiked) {
      await unlikeRecipes(recetteId, userId);
    } else {
      await toggleLikeRecipes(recetteId, userId);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const recetteRef = doc(db, 'recipesRequest', recetteId);
      const recetteSnap = await getDoc(recetteRef);
      if (!recetteSnap.exists()) return;

      const recetteData = recetteSnap.data();
      const docRef = await addDoc(collection(db, 'recipes'), {
        ...recetteData,
        createdAt: new Date()
      });

      if (docRef.id) {
        await declineRequest(); // Remove from requests after successful addition
      }
    } catch (error) {
      console.error('Error handling recipe request:', error);
    }
  };

  const declineRequest = async () => {
    try {
      await deleteDoc(doc(db, 'recipesRequest', recetteId));
    } catch (error) {
      console.error('Error declining recipe:', error);
    }
  };

  const slugify = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();
  };

  const renderImage = () => {
    if (images.length === 0) {
      return <div className="recipe-placeholder">Pas d'image</div>;
    }

    return (
      <img 
        src={images[0]} 
        alt={title} 
        className="recipe-image"
      />
    );
  };

  const renderAdminButtons = () => {
    if (!fromRequest || role !== 'admin') return null;

    return (
      <div className="admin-actions">
        <Button 
          label="Accepter" 
          icon="pi pi-check" 
          onClick={handleAcceptRequest}
          className="accept-button"
        />
        <Button 
          label="Refuser" 
          icon="pi pi-times" 
          onClick={declineRequest}
          className="decline-button"
        />
      </div>
    );
  };

  return (
    <article className={`recipe-card ${fromRequest ? 'recipe-request' : ''}`}>
      <div className="recipe-image-container">
        {renderImage()}
      </div>

      <div className="recipe-content">
        <h2 className="recipe-title">{title}</h2>
        
        <div className="recipe-tags">
          <span className="recipe-type">{type}</span>
          {position && <span className="recipe-location">📍 {position}</span>}
        </div>

        <div className="recipe-actions">
          {renderAdminButtons()}
          
          <div className="main-actions">
            {!fromRequest && (
              <div className='Post_admin_actions'>
                <Link to={`/recettes/${slugify(title)}`} className="view-recipe">
                  <Button 
                    label="Voir la recette" 
                    icon="pi pi-eye"
                    className="p-button-primary view-button"
                  />
                </Link>
                
                <Button 
                  className='Post_likeButton'
                  onClick={handleLike}
                  severity={hasLiked ? "danger" : "secondary"}
                  icon={hasLiked ? "pi pi-heart-fill" : "pi pi-heart"}
                  label={likes.length.toString()}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </article>
  );
};

export default Recette;
