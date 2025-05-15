import React, { useEffect, useState } from 'react';
import './Actualites.css';
// import Actualite from '@/components/Actualite/Actualite';

import { db } from '@firebaseModule';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface RecetteData {
  recetteId: string;
  title: string;
  type: string;
  images?: string[];
  position: string;
}


const Actualites: React.FC = () => {

  const [recettes, setRecettes] = React.useState<RecetteData[]>([]);
  const [featuredRecette, setFeaturedRecette] = useState<RecetteData | null>(null);


  useEffect(() => {
    fetchRecettes();
  }, []);

  const fetchRecettes = async () => {
    try {
      const recettesCollection = collection(db, "recipes");
      const querySnapshot = await getDocs(recettesCollection);

      const recettesData: RecetteData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        recettesData.push({
          title: data.title,
          type: data.type,
          position: data.position,
          recetteId: doc.id,
          images: data.images ?? [],
        });
      });

      setRecettes(recettesData);
      selectWeeklyFeaturedRecette(recettesData);
    } catch (error) {
      console.error("Error fetching recettes: ", error);
    }
  };

  // 📅 Choix d'une recette aléatoire par semaine
  const selectWeeklyFeaturedRecette = (recettes: RecetteData[]) => {
    const stored = localStorage.getItem("featuredRecette");
    const today = new Date();
    const currentWeek = `${today.getFullYear()}-W${getWeekNumber(today)}`;

    if (stored) {
      const { recette, week } = JSON.parse(stored);
      if (week === currentWeek) {
        setFeaturedRecette(recette);
        return;
      }
    }
        // Choix aléatoire si nouvelle semaine
    const randomRecette = recettes[Math.floor(Math.random() * recettes.length)];
    localStorage.setItem("featuredRecette", JSON.stringify({
      recette: randomRecette,
      week: currentWeek
    }));
    setFeaturedRecette(randomRecette);
  };

  // 📅 Obtenir numéro de semaine de l'année
  const getWeekNumber = (d: Date): number => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

   const slugify = (str: string) =>
    str
      .normalize("NFD") // supprime les accents
      .replace(/[\u0300-\u036f]/g, "") // encore plus d'accents
      .replace(/[^\w\s-]/g, "") // supprime les caractères spéciaux
      .trim()
      .replace(/\s+/g, "_") // espaces -> _
      .toLowerCase();


  return (
    <div className="Actualites">
      {featuredRecette && (
        <section className="featured-recette">
          <h2>🥇 Recette de la semaine</h2>
          <div className="featured-card">
            {featuredRecette.images?.[0] && (
              <img
                src={featuredRecette.images[0]}
                alt={featuredRecette.title}
                className="featured-img"
              />
            )}
            <div className="featured-content">
              <h3>{featuredRecette.title}</h3>
              <p><strong>Type:</strong> {featuredRecette.type}</p>
              <Link to={`/recettes/${slugify(featuredRecette.title)}`}>
                <button className="featured-button">Voir la recette</button>
              </Link>
            </div>
          </div>
        </section>
      )}


      {/* <h1>Ici sera bientôt mis en place les actualités culinaires et gastronomiques</h1> */}
      {/* <Actualite />
      <Actualite />
      <Actualite /> */}
    </div>
  );
};

export default Actualites;
