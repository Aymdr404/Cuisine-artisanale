// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCRqPaeQ_8kRByuf8l9_Fkcbmdgy_0aWI4",
    authDomain: "recettes-cuisine-a1bf2.firebaseapp.com",
    projectId: "recettes-cuisine-a1bf2",
    storageBucket: "recettes-cuisine-a1bf2.firebasestorage.app",
    messagingSenderId: "854150054780",
    appId: "1:854150054780:web:e3866880aea3e01d5c1af9",
    measurementId: "G-1J6YNX5LZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Pour la base de données Firestore
const storage = getStorage(app); // Pour le stockage des fichiers (vidéos, images, etc.)

export { db, storage };
