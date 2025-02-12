import React from 'react';
import './Recettes.css';
import Filtre from '@/components/Filtre/Filtre';
import Recette from '@/components/Recette/Recette';
import AddRecette from '@/components/AddRecette/AddRecette';

import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';


interface Recette {
  recetteId: string;
  title: string;
  description: string;
  type: string;
}

const Recettes: React.FC = () => {

  const [recettes, setRecettes] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchRecettes();
  }, []);

  const fetchRecettes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const recettesData: Recette[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          description: data.description,
          type: data.type,
          recetteId: doc.id
        } as Recette;
      });
    setRecettes(recettesData);
    }
    catch (error) {
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
