import { db } from "@firebaseModule";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export const toggleLikeRecipes = async (recetteId: string, userId: string) => {
  try {
    // --- Côté recette ---
    const recipesRef = doc(db, "recipes", recetteId);
    const recipeSnap = await getDoc(recipesRef);

    if (!recipeSnap.exists()) {
      console.warn("Recette non trouvée");
      return;
    }

    const recipeData = recipeSnap.data();

    // Vérifier si likes existe et contient déjà userId
    if (!Array.isArray(recipeData.likes) || !recipeData.likes.includes(userId)) {
      await updateDoc(recipesRef, {
        likes: arrayUnion(userId),
      });
      console.log(`User ${userId} ajouté aux likes de la recette ${recetteId}`);
    } else {
      console.log("User already liked this recipe");
    }

    // --- Côté utilisateur ---
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn("Utilisateur non trouvé");
      return;
    }

    const userData = userSnap.data();

    // Vérifier si likedRecipes existe et contient déjà recetteId
    if (!Array.isArray(userData.likedRecipes) || !userData.likedRecipes.includes(recetteId)) {
      await updateDoc(userRef, {
        likedRecipes: arrayUnion(recetteId),
      });
      console.log(`Recette ${recetteId} ajoutée aux likedRecipes de l'utilisateur ${userId}`);
    } else {
      console.log("Recette already in user's likedRecipes");
    }

  } catch (error) {
    console.error("Error liking post: ", error);
  }
};


export const unlikeRecipes = async (recetteId: string, userId: string) => {
  try {
    // Supprimer le like dans la recette
    const recipesRef = doc(db, "recipes", recetteId);
    await updateDoc(recipesRef, {
      likes: arrayRemove(userId),
    });

    // Récupérer l'utilisateur
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn("Utilisateur non trouvé");
      return;
    }

    const userData = userSnap.data();

    // Vérifier si likedRecipes existe et contient recetteId
    if (Array.isArray(userData.likedRecipes) && userData.likedRecipes.includes(recetteId)) {
      await updateDoc(userRef, {
        likedRecipes: arrayRemove(recetteId),
      });
      console.log(`Recette ${recetteId} retirée des likedRecipes`);
    } else {
      console.log("likedRecipes n'existe pas ou ne contient pas cette recette");
    }

  } catch (error) {
    console.error("Error unliking post: ", error);
  }
};
