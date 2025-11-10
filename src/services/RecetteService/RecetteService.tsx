import { db } from "@firebaseModule";
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";

export const toggleLikeRecipes = async (recetteId: string, userId: string) => {
  try {
    // Vérifier si la recette existe
    const recipesRef = doc(db, "recipes", recetteId);
    const recipeSnap = await getDoc(recipesRef);

    if (!recipeSnap.exists()) {
      console.warn("Recette non trouvée");
      return;
    }

    // Vérifier si l'utilisateur existe
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn("Utilisateur non trouvé");
      return;
    }

    const userData = userSnap.data();
    const userName = userData.displayName || userData.email || "Anonyme";

    // Créer un ID unique pour le like basé sur userId et recetteId
    const likeId = `${userId}_${recetteId}`;
    const likeRef = doc(db, "likes", likeId);

    // Vérifier si le like existe déjà
    const likeSnap = await getDoc(likeRef);

    if (!likeSnap.exists()) {
      // Ajouter le like
      await setDoc(likeRef, {
        userId: userId,
        userName: userName,
        recetteId: recetteId,
        createdAt: serverTimestamp(),
      });
      console.log(`Like ajouté: ${userName} a liké la recette ${recetteId}`);
    } else {
      console.log("User a déjà liké cette recette");
    }

  } catch (error) {
    console.error("Error liking recipe: ", error);
  }
};


export const unlikeRecipes = async (recetteId: string, userId: string) => {
  try {
    // Créer l'ID unique du like
    const likeId = `${userId}_${recetteId}`;
    const likeRef = doc(db, "likes", likeId);

    // Vérifier si le like existe
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      // Supprimer le like
      await deleteDoc(likeRef);
      console.log(`Like supprimé: userId ${userId} pour recette ${recetteId}`);
    } else {
      console.warn("Like non trouvé");
    }

  } catch (error) {
    console.error("Error unliking recipe: ", error);
  }
};

// Fonction utilitaire pour récupérer tous les likes d'une recette
export const getRecipeLikes = async (recetteId: string) => {
  try {
    const likesRef = collection(db, "likes");
    const q = query(likesRef, where("recetteId", "==", recetteId));
    const querySnapshot = await getDocs(q);

    const likes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return likes;
  } catch (error) {
    console.error("Error fetching recipe likes: ", error);
    return [];
  }
};

// Fonction utilitaire pour vérifier si un utilisateur a liké une recette
export const hasUserLikedRecipe = async (recetteId: string, userId: string) => {
  try {
    const likeId = `${userId}_${recetteId}`;
    const likeRef = doc(db, "likes", likeId);
    const likeSnap = await getDoc(likeRef);

    return likeSnap.exists();
  } catch (error) {
    console.error("Error checking user like: ", error);
    return false;
  }
};

// Fonction utilitaire pour compter les likes d'une recette
export const countRecipeLikes = async (recetteId: string) => {
  try {
    const likesRef = collection(db, "likes");
    const q = query(likesRef, where("recetteId", "==", recetteId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
  } catch (error) {
    console.error("Error counting recipe likes: ", error);
    return 0;
  }
};
