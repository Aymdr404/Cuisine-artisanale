import React, { useEffect, useState } from 'react';
import './Recettes.css';
import Filtre from '@components/Filtre/Filtre';
import Recette from '@components/Recette/Recette';
import AddRecette from '@components/AddRecette/AddRecette';

import { db } from '@firebaseModule';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';


interface RecetteData {
  recetteId: string;
  title: string;
  type: string;
  images?: string[];
  position: string;
}

const Recettes: React.FC = () => {

  const [recettes, setRecettes] = useState<RecetteData[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [departements, setDepartements] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchRecettes();
  }, [location.search]);

  const fetchRecettes = async () => {
    try {
      const recettesCollection = collection(db, "recipes");
      let recettesQuery = query(recettesCollection);
  
      const type = queryParams.get("type");
      const position = queryParams.get("position");
      const keywords = queryParams.get("keywords");
  
      let allRecettes = new Map<string, RecetteData>();
  
      if (keywords) {
        const words = keywords.toLowerCase().split(" ");
  
        for (const word of words) {
          const wordQuery = query(
            recettesCollection,
            where("titleKeywords", "array-contains", word)
          );
  
          const querySnapshot = await getDocs(wordQuery);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            allRecettes.set(doc.id, {
              title: data.title,
              type: data.type,
              position: data.position,
              recetteId: doc.id,
              images: data.images ?? [],
            });
          });
        }
      } else {
        const querySnapshot = await getDocs(recettesQuery);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allRecettes.set(doc.id, {
            title: data.title,
            type: data.type,
            position: data.position,
            recetteId: doc.id,
            images: data.images ?? [],
          });
        });
      }
  
      let recettesData = Array.from(allRecettes.values());
  
      // 🔍 Filtrer selon le type et la position après récupération
      if (type) {
        recettesData = recettesData.filter((r) => r.type === type);
      }
      if (position) {
        recettesData = recettesData.filter((r) => r.position === position);
      }
  
      setRecettes(recettesData);
    } catch (error) {
      console.error("Error getting recettes: ", error);
    }
  };

  useEffect(() => {
    fetch("https://geo.api.gouv.fr/departements")
      .then(res => res.json())
      .then(data => {
        const departementMap: Map<string, string> = new Map(data.map((dep: { code: string; nom: string }) => [dep.code, dep.nom]));
        setDepartements(departementMap);
      });
  }, []);
  
  
  return (
    <div className="Recettes">
      <section className='filter_section'>
        <Filtre />
        <AddRecette />
      </section>
      {recettes &&(
          <section className='recettes_section'>
            {recettes.map((recette, index) => (
              <Recette key={index} recetteId={recette.recetteId} title={recette.title} type={recette.type} images={recette.images} position={departements.get(recette.position) || "Inconnu"}  />
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
