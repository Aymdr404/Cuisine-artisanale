import React, { useEffect, useState } from 'react';
import './RecettesAdmin.css';

import {  db } from '@firebaseModule';
import {collection, onSnapshot, orderBy, query } from '@firebase/firestore';
import Recette from '@components/Recette/Recette';


interface RecetteInterface {
  recetteId: string;
  title: string;
  description: string;
  type: string;
  createdBy: string;
}

const RecettesAdmin: React.FC = () => {

  const [recettes, setRecettes] = useState<RecetteInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = fetchRecettes();

    return () => unsubscribe();
  }, []);

  const fetchRecettes = () => {
    setLoading(true);
    const recettesCollection = query(
        collection(db, "recipesRequest"),
        orderBy("createdAt", "desc"),
      );

    const unsubscribe = onSnapshot(recettesCollection, (querySnapshot) => {
      const recettesData: RecetteInterface[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const recetteData = data as RecetteInterface;
        return {
          title: recetteData.title,
          type: recetteData.type,
          recetteId: doc.id,
          createdBy: recetteData.createdBy,
        } as RecetteInterface;
      });
      setRecettes(recettesData);
      setLoading(false);
    }, (error) => {
      console.error("Error getting recettes: ", error);
      setLoading(false);
    });
    return unsubscribe;
  };


  return (
    <div className="RecettesAdmin">
      <h1>RecettesAdmin Component</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='RecettesAdmin__list'>
          {recettes.map((recette, index) => (
            <Recette key={index} recetteId={recette.recetteId} title={recette.title} description={recette.description} type={recette.type} fromRequest />
          ))}
        </div>
      )}
      {recettes.length === 0 && !loading && <p>No recettes found</p>}
    </div>
  );
};

export default RecettesAdmin;
