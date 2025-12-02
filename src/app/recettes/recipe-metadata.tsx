'use client';

import { useEffect } from 'react';

interface RecipeMetadataProps {
  recipeId?: string;
  title?: string;
  type?: string;
  image?: string;
}

/**
 * Composant pour mettre à jour dynamiquement les métadonnées Open Graph
 * Utilisé pour la vue détail d'une recette
 * Note: Utilise l'image de la recette directement au lieu du API route
 * pour la compatibilité avec le static export
 */
export default function RecipeMetadata({
  recipeId,
  title,
  type = 'Recette',
  image,
}: RecipeMetadataProps) {
  useEffect(() => {
    if (title) {
      // Mettre à jour le titre du document
      document.title = `${title} | Cuisine Artisanale`;

      // Meta OG:Title
      let metaOGTitle = document.querySelector('meta[property="og:title"]');
      if (!metaOGTitle) {
        metaOGTitle = document.createElement('meta');
        metaOGTitle.setAttribute('property', 'og:title');
        document.head.appendChild(metaOGTitle);
      }
      metaOGTitle.setAttribute('content', title);

      // Meta OG:Description
      let metaOGDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (!metaOGDescription) {
        metaOGDescription = document.createElement('meta');
        metaOGDescription.setAttribute('property', 'og:description');
        document.head.appendChild(metaOGDescription);
      }
      metaOGDescription.setAttribute(
        'content',
        `Découvrez la recette "${title}" sur Cuisine Artisanale`
      );

      // Meta OG:Image
      if (image) {
        let metaOGImage = document.querySelector('meta[property="og:image"]');
        if (!metaOGImage) {
          metaOGImage = document.createElement('meta');
          metaOGImage.setAttribute('property', 'og:image');
          document.head.appendChild(metaOGImage);
        }
        metaOGImage.setAttribute('content', image);
      }

      // Meta OG:Image:Width
      let metaOGImageWidth = document.querySelector(
        'meta[property="og:image:width"]'
      );
      if (!metaOGImageWidth) {
        metaOGImageWidth = document.createElement('meta');
        metaOGImageWidth.setAttribute('property', 'og:image:width');
        document.head.appendChild(metaOGImageWidth);
      }
      metaOGImageWidth.setAttribute('content', '1200');

      // Meta OG:Image:Height
      let metaOGImageHeight = document.querySelector(
        'meta[property="og:image:height"]'
      );
      if (!metaOGImageHeight) {
        metaOGImageHeight = document.createElement('meta');
        metaOGImageHeight.setAttribute('property', 'og:image:height');
        document.head.appendChild(metaOGImageHeight);
      }
      metaOGImageHeight.setAttribute('content', '630');

      // Meta OG:URL
      let metaOGUrl = document.querySelector('meta[property="og:url"]');
      if (!metaOGUrl) {
        metaOGUrl = document.createElement('meta');
        metaOGUrl.setAttribute('property', 'og:url');
        document.head.appendChild(metaOGUrl);
      }
      const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      metaOGUrl.setAttribute('content', currentUrl);

      // Twitter Card
      let metaTwitterCard = document.querySelector(
        'meta[name="twitter:card"]'
      );
      if (!metaTwitterCard) {
        metaTwitterCard = document.createElement('meta');
        metaTwitterCard.setAttribute('name', 'twitter:card');
        document.head.appendChild(metaTwitterCard);
      }
      metaTwitterCard.setAttribute('content', 'summary_large_image');

      // Twitter Title
      let metaTwitterTitle = document.querySelector(
        'meta[name="twitter:title"]'
      );
      if (!metaTwitterTitle) {
        metaTwitterTitle = document.createElement('meta');
        metaTwitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(metaTwitterTitle);
      }
      metaTwitterTitle.setAttribute('content', title);

      // Twitter Description
      let metaTwitterDescription = document.querySelector(
        'meta[name="twitter:description"]'
      );
      if (!metaTwitterDescription) {
        metaTwitterDescription = document.createElement('meta');
        metaTwitterDescription.setAttribute('name', 'twitter:description');
        document.head.appendChild(metaTwitterDescription);
      }
      metaTwitterDescription.setAttribute(
        'content',
        `Découvrez la recette "${title}" sur Cuisine Artisanale`
      );

      // Twitter Image
      if (image) {
        let metaTwitterImage = document.querySelector(
          'meta[name="twitter:image"]'
        );
        if (!metaTwitterImage) {
          metaTwitterImage = document.createElement('meta');
          metaTwitterImage.setAttribute('name', 'twitter:image');
          document.head.appendChild(metaTwitterImage);
        }
        metaTwitterImage.setAttribute('content', image);
      }
    }
  }, [title, type, image]);

  return null; // Ce composant ne rend rien, il gère juste les métadonnées
}
