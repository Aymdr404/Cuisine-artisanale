import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

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
const db = getFirestore(app);

async function generateSitemap() {
    const sitemapStream = new SitemapStream({ hostname: "https://aymeric-sabatier.fr" });

    const writeStream = createWriteStream("./public/sitemap.xml");
    sitemapStream.pipe(writeStream);

    const baseUrl = "https://www.aymeric-sabatier.fr/Cuisine-artisanale"; // URL sans le #/
    const urls = [
        "/",
        "/recettes",
        "/about",
        "/recettes/add-recipe",
        "/recettes/:recipeName",
        "/recettes/:id/edit",
        "/map",
        "/account",
        "/account/mes-recettes",
        "/account/mes-favoris",
        // Ajoute d'autres routes de ton application ici
    ].map(route => `${baseUrl}${route}`);

    urls.forEach(route => sitemapStream.write({ url: route, changefreq: "weekly", priority: 0.8 }));
    
    try {
        const recettesSnap = await getDocs(collection(db, "recipes"));
        recettesSnap.forEach(doc => {
            const recette = doc.data();
            const recipeSlug = recette.title.replace(/\s+/g, "_").toLowerCase(); // Transforme le titre en slug
            sitemapStream.write({ url: `/recettes/${recipeSlug}`, changefreq: "weekly", priority: 0.9 });
        });
    
        sitemapStream.end();
        await streamToPromise(sitemapStream);
        console.log("✅ Sitemap généré avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors de la génération du sitemap :", error);
    }
}

generateSitemap();