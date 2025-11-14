"use server";

import { Metadata } from "next";
import { doc, getDoc } from "@firebase/firestore";
import { db } from "@firebaseModule";
import { redirect } from "next/navigation";

interface RecipeShareProps {
  params: Promise<{ id: string }>;
}

interface Recette {
  id: string;
  title: string;
  type: string;
  images?: string[];
  description?: string;
  preparationTime?: number;
  cookingTime?: number;
}

// Générer les métadonnées dynamiquement
export async function generateMetadata(
  { params }: RecipeShareProps
): Promise<Metadata> {
  try {
    const { id } = await params;
    const recetteRef = doc(db, "recipes", id);
    const recetteSnap = await getDoc(recetteRef);

    if (!recetteSnap.exists()) {
      return {
        title: "Recette non trouvée",
        description: "La recette que vous recherchez n'existe pas.",
      };
    }

    const recipe = recetteSnap.data() as Recette;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.aymeric-sabatier.fr";
    const shareUrl = `${baseUrl}/recettes/share/${id}`;
    const imageUrl = recipe.images?.[0] || `${baseUrl}/og-image.png`;

    return {
      title: `${recipe.title} | Cuisine Artisanale`,
      description: `Découvrez la recette ${recipe.title}. Type: ${recipe.type}. Temps de préparation: ${recipe.preparationTime || "N/A"} min.`,
      openGraph: {
        title: recipe.title,
        description: `Découvrez la recette ${recipe.title} sur Cuisine Artisanale`,
        url: shareUrl,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: recipe.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: recipe.title,
        description: `Découvrez la recette ${recipe.title} sur Cuisine Artisanale`,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Erreur lors de la génération des métadonnées:", error);
    return {
      title: "Partage de recette",
      description: "Découvrez nos délicieuses recettes",
    };
  }
}

// Rediriger vers la page de recette avec l'ID
export default async function SharePage({ params }: RecipeShareProps) {
  const { id } = await params;

  // Rediriger vers la page de recette originale
  redirect(`/recettes?id=${id}`);
}
