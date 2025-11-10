"use client";
import React, { useEffect, useState } from 'react';
import './Actualites.css';
import { db } from '@firebaseModule';
import { doc, getDoc} from 'firebase/firestore';
import Link from 'next/link';

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


      if (weeklySnap.exists()) {
		setFeaturedRecette(weeklySnap.data() as RecetteData);
		setLoading(false);
		return;

      }
    } catch (error) {
      console.error("Erreur lors du chargement de la recette de la semaine :", error);
    } finally {
      setLoading(false);
    }
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
				height={400}
				width={600}
			/>
			)}
			<div className="featured-content">
			<h3>{featuredRecette.title}</h3>
			<p><strong>Type :</strong> {featuredRecette.type}</p>
			{featuredRecette.position && <p>📍 {featuredRecette.position}</p>}
			<Link href={`/recettes/${slugify(featuredRecette.title)}`}>
				<button className="featured-button">Voir la recette</button>
			</Link>
			</div>
		</div>
	</section>
  );
};

export default Actualites;
