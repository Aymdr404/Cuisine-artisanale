import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Ajout de collection et addDoc
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";  

const firebaseConfig = {
    apiKey: "AIzaSyCRqPaeQ_8kRByuf8l9_Fkcbmdgy_0aWI4",
    authDomain: "recettes-cuisine-a1bf2.firebaseapp.com",
    projectId: "recettes-cuisine-a1bf2",
    storageBucket: "recettes-cuisine-a1bf2.firebasestorage.app",
    messagingSenderId: "854150054780",
    appId: "1:854150054780:web:e3866880aea3e01d5c1af9",
    measurementId: "G-1J6YNX5LZM"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Authentification
const db = getFirestore(app); // Firestore
const storage = getStorage(app); // Stockage (si nécessaire)

export { db, storage, auth };
