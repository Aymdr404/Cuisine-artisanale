/**
 * Service de partage de recettes
 * Gère le partage natif et la génération des URLs avec métadonnées
 */

export interface ShareOptions {
  title: string;
  description: string;
  recipeId: string;
  imageUrl?: string;
}

/**
 * Génère l'URL de partage avec métadonnées
 */
export const generateShareUrl = (recipeId: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.aymeric-sabatier.fr";
  return `${baseUrl}/recettes/share/${recipeId}`;
};

/**
 * Partage la recette via l'API Web Share (natif sur mobile/certains navigateurs)
 */
export const shareRecipe = async (options: ShareOptions): Promise<void> => {
  const { title, description, recipeId } = options;
  const shareUrl = generateShareUrl(recipeId);

  // Vérifier si l'API Web Share est disponible
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: description,
        url: shareUrl,
      });
      return;
    } catch (error: any) {
      // L'utilisateur a annulé le partage ou une erreur est survenue
      if (error.name !== "AbortError") {
        console.error("Erreur lors du partage:", error);
      }
    }
  }

  // Fallback : copier dans le presse-papiers
  await copyShareLink(shareUrl);
};

/**
 * Copie le lien de partage dans le presse-papiers
 */
export const copyShareLink = async (url: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(url);
    return;
  } catch (error) {
    console.error("Erreur lors de la copie du lien:", error);
    throw new Error("Impossible de copier le lien");
  }
};

/**
 * Génère une URL de partage pour les réseaux sociaux
 */
export const generateSocialShareUrls = (
  recipeId: string,
  title: string,
  description: string
) => {
  const shareUrl = generateShareUrl(recipeId);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedDescription}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
  };
};
