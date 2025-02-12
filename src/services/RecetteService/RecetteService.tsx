import { db } from "../../firebase"; // Assure-toi que le chemin est correct
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export const toggleLikePost = async (recetteId: string, userId: string) => {
  try {
    const postRef = doc(db, "recipes", recetteId);

    await updateDoc(postRef, {
      likes: arrayUnion(userId),
    });

  } catch (error) {
    console.error("Error liking post: ", error);
  }
};

export const unlikePost = async (recetteId: string, userId: string) => {
  try {
    const postRef = doc(db, "recipes", recetteId);

    await updateDoc(postRef, {
      likes: arrayRemove(userId),
    });

  } catch (error) {
    console.error("Error unliking post: ", error);
  }
};
