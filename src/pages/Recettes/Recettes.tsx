import React, { useEffect } from 'react';
import './Recettes.css';
import Filtre from '@/components/Filtre/Filtre';
import Recette from '@/components/Recette/Recette';
import AddRecette from '@/components/AddRecette/AddRecette';

import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';


interface Recette {
  recetteId: string;
  title: string;
  description: string;
  type: string;
}

const Recettes: React.FC = () => {

  const [recettes, setRecettes] = React.useState<any[]>([]);
  const [type, setType] = React.useState<string | null>(null);
  const [position, setPosition] = React.useState<string | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    fetchRecettes();
    fetchUrlParams();
  }, []);

  const fetchUrlParams = () => {
    setType(queryParams.get('type'));
    setPosition(queryParams.get('position'));
    console.log(type, position);
  }

  const fetchRecettes = async () => {
    try {
      let recettesQuery = collection(db, "recipes");

      // Appliquer le filtre sur 'type' si il existe
      if (type) {
        recettesQuery = query(recettesQuery, where("type", "==", type));
      }

      // Appliquer le filtre sur 'position' si il existe
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
      setRecettes(recettesData); // Mettre à jour les recettes
    } catch (error) {
      console.error("Error getting recettes: ", error);
    }
  };


  return (
    <div className="Recettes">
      <section className='filter_section'>
        <Filtre />
        <AddRecette />
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
