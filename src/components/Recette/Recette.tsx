import React, { useEffect, useState } from 'react';
import './Recette.css';

import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext/AuthContext';

import { toggleLikeRecipes, unlikeRecipes } from '@/services/RecetteService/RecetteService';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, updateDoc } from '@firebase/firestore';
import { db } from '@firebaseModule';

interface RecetteProps {
  recetteId: string;
  title: string;
  type: string;
  fromRequest?: boolean;
  images?: string[];
}

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
  createdBy: string;
  createdAt: any;
  images: string[];
}

const Recette: React.FC<RecetteProps> = ({recetteId, title, type, fromRequest = false, images = []}) => {

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
    if (!userId) return alert("You must be logged in to like a post!");
    if (hasLiked) {
      await unlikeRecipes(recetteId, userId);
    } else {
      await toggleLikeRecipes(recetteId, userId);
    }
  };

  const handleAcceptRequest = async () => {
    let recetteIdNew: string | undefined;
    let recetteRef = doc(db, 'recipesRequest', recetteId);
    let recetteSnap = await getDoc(recetteRef);
    let recetteData = recetteSnap.data() as Recette;

    try {
      const docRef = await addDoc(collection(db, 'recipes'), {
        title: '',
        type: '',
        ingredients: '',
        preparationTime: '',
        cookingTime: '',
        video: '',
        images: [],
        steps: [],
        position: '',
        createdBy: '',
      });
      
      recetteIdNew = docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
    }

    if (recetteIdNew) {
      try {
        const recetteRefNew = doc(db, 'recipes', recetteIdNew);
        await updateDoc(recetteRefNew, {
          title: recetteData.title,
          type: recetteData.type,
          ingredients: recetteData.ingredients,
          preparationTime: recetteData.preparationTime,
          cookingTime: recetteData.cookingTime,
          video: recetteData.video,
          steps: recetteData.steps,
          position: recetteData.position,
          createdBy: recetteData.createdBy,
          createdAt: recetteData.createdAt,
          images: recetteData.images
        });
      } catch (error) {
        console.error('Error updating post:', error);
      }
    } else {
      console.error('postIdNew is undefined');
    }
    await declineRequest();
  }

  const declineRequest = async () => {
    try {
      const recetteRef = doc(db, 'recipesRequest', recetteId);
      await deleteDoc(recetteRef);
    } catch (error) {
      console.error('Erreur de suppression de l\'utilisateur : ', error);
    }
  }
  
  return (
    <div className={`Recette ${fromRequest ? 'Recette_request' : ''}`}>
      <section className="Recette_header">
        <h1>{title}</h1>
          {(!fromRequest && 
            <Button className='Recette_likeButton' onClick={handleLike} severity={hasLiked ? "danger" : "secondary"} >
                {hasLiked ? `❤️ ${likes.length}` : `🤍 ${likes.length}`}
            </Button>
          )}
      </section>
      <p>{type}</p>


      <section className="Recette_images">
        {images.length === 0 && <p>No images</p>}

        {!fromRequest && images.length !== 0 &&
          <img src={images[0]} alt="recette" />
        }

        {fromRequest && images.length !== 0 && 
          images.map((image, index) => (
            <img key={index} src={image} alt="recette" />
          ))
        }
      </section>

        
      <div className='bouton_section'>
        {fromRequest && role === 'admin' && (
          <div className='Recette_acceptButton'>
            <Button label="Accept" icon="pi pi-check" onClick={handleAcceptRequest}/>
            <Button label="Decline" icon="pi pi-times" onClick={declineRequest}/>
          </div>
        )}

        {!fromRequest && (
          <Link to={`/recettes/${recetteId}`}>
            <Button>Voir la recette</Button>
          </Link>
        )}
        
      </div>

    </div>
  );
};

export default Recette;
