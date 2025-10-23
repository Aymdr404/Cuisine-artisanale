import React, { useEffect, useState } from 'react';
import './AccountRecetteFavoris.css';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
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
}

const AccountRecetteFavoris: React.FC = () => {
  const [recettes, setRecettes] = useState<RecetteInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchRecettes();
  }, [user]);

  const fetchRecettes = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("Utilisateur non connecté");
        return;
      }

      // Récupérer le document utilisateur
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("Utilisateur non trouvé");
        return;
      }

      const userData = userSnap.data();
      const likedRecipesIds: string[] = userData.likedRecipes || [];

      if (likedRecipesIds.length === 0) {
        setRecettes([]);
        return;
      }

      // Récupérer toutes les recettes correspondant aux IDs
      const recipesCollection = collection(db, "recipes");
      const recettesQuery = query(
        recipesCollection,
        where("__name__", "in", likedRecipesIds) // on peut faire max 10 IDs par query
      );

      const querySnapshot = await getDocs(recettesQuery);

      const recettesData: RecetteInterface[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          recetteId: doc.id,
          title: data.title,
          type: data.type,
          images: data.images,
          position: data.position
        };
      });

      // Trier selon l’ordre des IDs dans likedRecipes (optionnel)
      recettesData.sort((a, b) => {
        return likedRecipesIds.indexOf(a.recetteId) - likedRecipesIds.indexOf(b.recetteId);
      });

      setRecettes(recettesData);

    } catch (error) {
      console.error("Erreur lors du chargement des recettes favorites: ", error);
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
