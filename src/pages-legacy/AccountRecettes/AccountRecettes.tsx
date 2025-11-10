"use client";
import React, { useEffect, useState } from 'react';
import './AccountRecettes.css';
import { collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '@firebaseModule';
import Recette from '@/components/Recette/Recette';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useRouter } from 'next/navigation';
import { Message } from 'primereact/message';

interface RecetteInterface {
  recetteId: string;
  title: string;
  type: string;
  images?: string[];
  position: string;
  createdAt?: Date;
}

const AccountRecettes: React.FC = () => {
  const [recettes, setRecettes] = useState<RecetteInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

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
        where("createdBy", "==", user.uid)
      );

      const querySnapshot = await getDocs(recettesQuery);
      const recettesData: RecetteInterface[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          description: data.description,
          type: data.type,
          position: data.position,
          recetteId: doc.id,
          images: data.images,
          createdAt: data.createdAt?.toDate(),
        } as RecetteInterface;
      });

      // Sort by creation date, newest first
      recettesData.sort((a, b) => {
        return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
      });

      setRecettes(recettesData);
    } catch (error) {
      console.error("Error getting recettes: ", error);
      setError("Erreur lors du chargement des recettes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = () => {
    router.push('/recettes/add-recipe');
  };

  if (loading) {
    return (
      <div className="recipes-loading">
        <ProgressSpinner />
        <p>Chargement de vos recettes...</p>
      </div>
    );
  }

  return (
    <div className="account-recipes">
      <div className="recipes-header">
        <h2>Mes Recettes</h2>
        <Button
          label="Créer une recette"
          icon="pi pi-plus"
          onClick={handleCreateRecipe}
          className="create-recipe-btn"
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
          <i className="pi pi-book empty-icon"></i>
          <h3>Vous n'avez pas encore créé de recettes</h3>
          <p>Commencez à partager vos délicieuses recettes avec la communauté !</p>
          <Button
            label="Créer ma première recette"
            icon="pi pi-plus"
            onClick={handleCreateRecipe}
          />
        </div>
      ) : (
        <div className="recipes-grid">
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

export default AccountRecettes;
