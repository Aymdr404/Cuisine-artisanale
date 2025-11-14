import { Metadata } from "next";
import { redirect } from "next/navigation";

interface RecipeShareProps {
  params: Promise<{ id: string }>;
}

// Générer les params statiques pour toutes les recettes (fallback vide)
// Avec output: export, on ne peut pas faire de requêtes à Firebase au build time
export async function generateStaticParams() {
  // Retourner un tableau vide - la redirection fonctionne avec les routes dynamiques
  return [];
}

// Générer les métadonnées avec des valeurs par défaut
export async function generateMetadata(
  { params }: RecipeShareProps
): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.aymeric-sabatier.fr";
  const shareUrl = `${baseUrl}/recettes/share/${id}`;

  // Métadonnées de base - les détails viendront côté client si besoin
  return {
    title: "Découvrez cette délicieuse recette | Cuisine Artisanale",
    description: "Explorez nos recettes artisanales et laissez-vous inspirer.",
    openGraph: {
      title: "Cuisine Artisanale",
      description: "Découvrez cette délicieuse recette",
      url: shareUrl,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Cuisine Artisanale",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cuisine Artisanale",
      description: "Découvrez cette délicieuse recette",
    },
  };
}

// Rediriger vers la page de recette avec l'ID
export default async function SharePage({ params }: RecipeShareProps) {
  const { id } = await params;

  // Rediriger vers la page de recette originale
  redirect(`/recettes?id=${id}`);
}
