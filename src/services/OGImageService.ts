/**
 * Service pour générer les URLs Open Graph des images
 */

interface OGImageParams {
  title: string;
  type?: string;
  image?: string;
  baseUrl?: string;
}

/**
 * Génère l'URL de l'image Open Graph pour une recette
 * @param params - Les paramètres de la recette
 * @returns L'URL de l'image OG
 */
export function generateOGImageUrl(params: OGImageParams): string {
  const {
    title,
    type = 'Recette',
    image,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.aymeric-sabatier.fr/Cuisine-artisanale',
  } = params;

  const searchParams = new URLSearchParams();
  searchParams.append('title', title);
  searchParams.append('type', type);

  if (image) {
    searchParams.append('image', image);
  }

  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

/**
 * Génère les métadonnées Open Graph pour une recette
 * @param params - Les paramètres de la recette
 * @returns Les métadonnées Open Graph
 */
export function generateOGMetadata(params: OGImageParams & { description?: string; url?: string }) {
  const {
    title,
    description = 'Découvrez cette délicieuse recette sur Cuisine Artisanale',
    type = 'Recette',
    image,
    url = 'https://www.aymeric-sabatier.fr/Cuisine-artisanale/recettes',
  } = params;

  const ogImageUrl = generateOGImageUrl({ title, type, image });

  return {
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
      siteName: 'Cuisine Artisanale',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@CuisineArtisanale',
    },
  };
}
