import React, { useEffect, useState } from 'react';
import './Recettes.css';
import Filtre from '@/components/Filtre/Filtre';
import Recette from '@/components/Recette/Recette';
import AddRecette from '@/components/AddRecette/AddRecette';

import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext/AuthContext';


interface Recette {
  recetteId: string;
  title: string;
  description: string;
  type: string;
}

const Recettes: React.FC = () => {

  const {role } = useAuth();

  const [recettes, setRecettes] = useState<any[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    fetchRecettes();
  }, [location.search]);

  const fetchRecettes = async () => {
    try {
      const recettesCollection = collection(db, "recipes");
      let recettesQuery = query(recettesCollection);

      const type = queryParams.get('type');
      const position = queryParams.get('position');


      if (type) {
        recettesQuery = query(recettesQuery, where("type", "==", type));
      }

      if (position) {
        recettesQuery = query(recettesQuery, where("position", "==", position));
      }

      const querySnapshot = await getDocs(recettesQuery);
      const recettesData: Recette[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          description: data.description,
          type: data.type,
          position: data.position,
          recetteId: doc.id,
        } as Recette;
      });
      setRecettes(recettesData);
    } catch (error) {
      console.error("Error getting recettes: ", error);
    }
  };

  return (
    <div className="Recettes">
      <section className='filter_section'>
        <Filtre />
        {role === 'admin' && (
          <AddRecette />
        )}
      </section>
      {recettes &&(
          <section className='recettes_section'>
            {recettes.map((recette, index) => (
              <Recette key={index} recetteId={recette.recetteId} title={recette.title} description={recette.description} type={recette.type} />
            ))}
          </section>
      )}
      {!recettes && (
        <p>Chargement...</p>
      )}
    </div>
  );
};

export default Recettes;
