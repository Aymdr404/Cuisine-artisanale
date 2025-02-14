import { db } from "@firebaseModule";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export const toggleLikeRecipes = async (recetteId: string, userId: string) => {
  try {
    const postRef = doc(db, "recipes", recetteId);

    await updateDoc(postRef, {
      likes: arrayUnion(userId),
    });

  } catch (error) {
    console.error("Error liking post: ", error);
  }
};

export const unlikeRecipes = async (recetteId: string, userId: string) => {
  try {
    const postRef = doc(db, "recipes", recetteId);

    await updateDoc(postRef, {
      likes: arrayRemove(userId),
    });

  } catch (error) {
    console.error("Error unliking post: ", error);
  }
};
