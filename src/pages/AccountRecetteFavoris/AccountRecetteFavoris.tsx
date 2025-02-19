import React, { useEffect, useState } from 'react';
import './AccountRecetteFavoris.css';

import { collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '@firebaseModule';
import Recette from '@/components/Recette/Recette';
import { useAuth } from '@/contexts/AuthContext/AuthContext';



interface RecetteInterface {
  recetteId: string;
  title: string;
  type: string;
}



const AccountRecetteFavoris: React.FC = () => {
  const [recettes, setRecettes] = useState<any[]>([]);
  const {user} = useAuth();

  useEffect(() => {
    fetchRecettes();
  }, []);

  const fetchRecettes = async () => {
    try {
      const recettesCollection = collection(db, "recipes");
      let recettesQuery = query(recettesCollection);

      recettesQuery = query(recettesQuery, where("likes", "array-contains", user?.uid));
      
      const querySnapshot = await getDocs(recettesQuery);
      const recettesData: RecetteInterface[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          description: data.description,
          type: data.type,
          position: data.position,
          recetteId: doc.id,
        } as RecetteInterface;
      });
      setRecettes(recettesData);
    } catch (error) {
      console.error("Error getting recettes: ", error);
    }
  };

  return (
    <div className="AccountRecetteFavoris">
      <h2>Mes recettes favories</h2>
      {recettes &&(
          <section className='recettes_section'>
            {recettes.map((recette, index) => (
              <Recette key={index} recetteId={recette.recetteId} title={recette.title} type={recette.type} />
            ))}
          </section>
      )}
      {!recettes && (
        <h3>Vous n'avez pas encore de recette en favoris</h3>
      )}
    </div>
  );
};

export default AccountRecetteFavoris;
