import React, { useEffect, useState } from 'react';
import './Actualites.css';
import { db } from '@firebaseModule';
import { collection, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface RecetteData {
  recetteId: string;
  title: string;
  type: string;
  images?: string[];
  position: string;
}

const Actualites: React.FC = () => {
  const [featuredRecette, setFeaturedRecette] = useState<RecetteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyRecette();
  }, []);

  const fetchWeeklyRecette = async () => {
    try {
      const weeklyRef = doc(db, "weeklyRecipe", "current");
      const weeklySnap = await getDoc(weeklyRef);
      const today = new Date();
      const currentWeek = `${today.getFullYear()}-W${getWeekNumber(today)}`;

      // Si on a déjà une recette enregistrée cette semaine, on la garde
      if (weeklySnap.exists()) {
        const data = weeklySnap.data() as RecetteData & { week?: string };
        if (data.week === currentWeek) {
          setFeaturedRecette(data);
          setLoading(false);
          return;
        }
      }

      // Sinon on choisit une nouvelle recette aléatoire
      const recettesCollection = collection(db, "recipes");
      const querySnapshot = await getDocs(recettesCollection);
      const recettes: RecetteData[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        recettes.push({
          title: data.title,
          type: data.type,
          position: data.position,
          recetteId: docSnap.id,
          images: data.images ?? [],
        });
      });

      const randomRecette = recettes[Math.floor(Math.random() * recettes.length)];

      // Sauvegarde dans Firestore pour être utilisée par les emails et les visiteurs
      await setDoc(weeklyRef, {
        ...randomRecette,
        week: currentWeek,
        createdAt: new Date(),
      });

      setFeaturedRecette(randomRecette);
    } catch (error) {
      console.error("Erreur lors du chargement de la recette de la semaine :", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekNumber = (d: Date): number => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const slugify = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

  if (loading) {
    return <p className="loading">Chargement de la recette de la semaine...</p>;
  }

  if (!featuredRecette) {
    return <p>Aucune recette disponible pour cette semaine.</p>;
  }

  return (
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
			<p><strong>Type :</strong> {featuredRecette.type}</p>
			{featuredRecette.position && <p>📍 {featuredRecette.position}</p>}
			<Link to={`/recettes/${slugify(featuredRecette.title)}`}>
				<button className="featured-button">Voir la recette</button>
			</Link>
			</div>
		</div>
	</section>
  );
};

export default Actualites;
