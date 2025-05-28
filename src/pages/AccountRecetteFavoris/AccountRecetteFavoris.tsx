import React, { useEffect, useState } from 'react';
import './AccountRecetteFavoris.css';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '@firebaseModule';
import Recette from '@/components/Recette/Recette';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

interface RecetteInterface {
  recetteId: string;
  title: string;
  type: string;
  images?: string[];
  position?: string;
  likedAt?: Date;
}

const AccountRecetteFavoris: React.FC = () => {
  const [recettes, setRecettes] = useState<RecetteInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecettes();
  }, [user]);

  const fetchRecettes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("Utilisateur non connecté");
        return;
      }

      const recettesCollection = collection(db, "recipes");
      const recettesQuery = query(
        recettesCollection,
        where("likes", "array-contains", user.uid)
      );
      
      const querySnapshot = await getDocs(recettesQuery);
      const recettesData: RecetteInterface[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          type: data.type,
          position: data.position,
          recetteId: doc.id,
          images: data.images,
          likedAt: data.likes_dates?.[user.uid]?.toDate(),
        } as RecetteInterface;
      });

      // Sort by liked date, newest first
      recettesData.sort((a, b) => {
        return (b.likedAt?.getTime() ?? 0) - (a.likedAt?.getTime() ?? 0);
      });

      setRecettes(recettesData);
    } catch (error) {
      console.error("Error getting favorite recipes: ", error);
      setError("Erreur lors du chargement des recettes favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleExploreRecipes = () => {
    navigate('/recettes');
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <ProgressSpinner />
        <p>Chargement de vos recettes favorites...</p>
      </div>
    );
  }

  return (
    <div className="account-favorites">
      <div className="favorites-header">
        <h2>Mes Recettes Favorites</h2>
        <Button 
          label="Explorer les recettes" 
          icon="pi pi-search" 
          onClick={handleExploreRecipes}
          className="explore-recipes-btn"
        />
      </div>

      {error && (
        <Message 
          severity="error" 
          text={error}
          className="error-message"
        />
      )}

      {!error && recettes.length === 0 ? (
        <div className="empty-state">
          <i className="pi pi-heart empty-icon"></i>
          <h3>Aucune recette favorite pour le moment</h3>
          <p>Explorez notre collection de recettes et ajoutez vos favorites à votre collection !</p>
          <Button 
            label="Découvrir des recettes" 
            icon="pi pi-search"
            onClick={handleExploreRecipes}
          />
        </div>
      ) : (
        <div className="favorites-grid">
          {recettes.map((recette) => (
            <Recette 
              key={recette.recetteId} 
              recetteId={recette.recetteId} 
              title={recette.title} 
              type={recette.type} 
              images={recette.images} 
              position={recette.position}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountRecetteFavoris;
