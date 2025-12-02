/**
 * Script pour générer les métadonnées de toutes les recettes en JSON statique
 * À exécuter avant le build : npm run generate-metadata && npm run build
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Configuration Firebase (à adapter avec tes variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function generateRecipeMetadata() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('📖 Fetching recipes from Firestore...');
    const recipesCollection = collection(db, 'recipes');
    const querySnapshot = await getDocs(recipesCollection);

    const recipeMetadata: Record<
      string,
      {
        title: string;
        type: string;
        image: string;
        description: string;
      }
    > = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recipeMetadata[doc.id] = {
        title: data.title || '',
        type: data.type || 'Recette',
        image: data.images?.[0] || '',
        description: `Découvrez la recette "${data.title}" sur Cuisine Artisanale`,
      };
    });

    // Créer le répertoire public s'il n'existe pas
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Écrire le fichier JSON
    const outputPath = path.join(publicDir, 'recipes-metadata.json');
    fs.writeFileSync(outputPath, JSON.stringify(recipeMetadata, null, 2));

    console.log(`✅ Generated metadata for ${Object.keys(recipeMetadata).length} recipes`);
    console.log(`📁 Saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating recipe metadata:', error);
    process.exit(1);
  }
}

generateRecipeMetadata();
