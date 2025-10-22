import { onDocumentUpdated } from "firebase-functions/v2/firestore";

const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

// Définir les types des données Firestore
interface RecipeRequest {
    title: string;
}


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});

// Définition de la fonction avec les types Firebase pour event
export const sendEmailOnNewRecipeRequest = onDocumentUpdated('recipesRequest/{objectId}', async (event) => {
    const newValue = event.data?.after.data() as RecipeRequest;
    if (!newValue) {
        console.error("Snapshot is undefined");
        return;
    }

    const name = newValue.title;

    const mailOptions = {
        from: process.env.EMAIL,
        to: "ssabatieraymeric@gmail.com",
        subject: "Nouvelle demande de recette",
        text: `Une nouvelle demande de recette a été ajoutée : ${name}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email envoyé !");
    } catch (error) {
        console.error("Erreur d'envoi d'email :", error);
    }
});

export const sendWeeklyRecipeEmail = async (email: string) => {
  try {
	// Référence document
	const weeklyRef = db.collection("weeklyRecipe").doc("current");

	// Récupérer le document
	const weeklySnap = await weeklyRef.get();
	if (weeklySnap.exists) {
		const data = weeklySnap.data();
		console.log(data);
	}

    if (!weeklySnap.exists) {
      throw new Error("Aucune recette de la semaine trouvée.");
    }

    const recipe = weeklySnap.data();

    // 🔗 Lien dynamique vers la recette
    const slug = recipe.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();

    const recipeUrl = `https://tonsite.fr/recettes/${slug}`;

    // 💌 2. Construire l’email HTML dynamique
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `🍰 Votre recette de la semaine : ${recipe.title}`,
      html: `
      <div style="
        font-family: 'Segoe UI', sans-serif;
        background-color: #fff8f2;
        color: #333;
        padding: 20px;
        border-radius: 12px;
        max-width: 600px;
        margin: 0 auto;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      ">
        <h1 style="text-align:center; color:#e36414;">🍪 ${recipe.title}</h1>
        <p style="text-align:center; font-size:16px;">Bonjour gourmand(e) !</p>
        <p style="font-size:15px; line-height:1.6;">
          Découvrez notre nouvelle recette ${recipe.type.toLowerCase()} de la semaine : simple, savoureuse et parfaite pour vos repas du dimanche 😋
        </p>

        <div style="text-align:center; margin:25px 0;">
          <img src="${recipe.image}"
               alt="${recipe.title}"
               style="width:100%; max-width:480px; border-radius:10px;" />
        </div>

        <div style="text-align:center;">
          <a href="${recipeUrl}"
             style="
               background-color:#e36414;
               color:#fff;
               padding:12px 24px;
               border-radius:8px;
               text-decoration:none;
               font-weight:bold;
               display:inline-block;
               transition:background 0.3s;
             ">
             👉 Voir la recette complète
          </a>
        </div>

        <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">

        <p style="font-size:14px; color:#777; text-align:center;">
          Vous recevez cet email car vous êtes inscrit(e) à la newsletter de
          <a href="https://tonsite.fr" style="color:#e36414; text-decoration:none;">Recettes Gourmandes</a> 🍰
          <br/>
          <small>Vous pouvez vous désabonner à tout moment.</small>
        </p>
      </div>
      `,
    };

    // 📤 3. Envoi du mail
    await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès à", email);
  } catch (error) {
    console.error("Erreur lors de l’envoi de l’email :", error);
  }
};

import { onSchedule } from "firebase-functions/v2/scheduler";

// ------------------- Cron planifié (dimanche 09:00) -------------------
export const sendWeeklyRecipe = onSchedule(
  {
    schedule: "0 9 * * 0",       // chaque dimanche à 09:00
    timeZone: "Europe/Paris"    // fuseau horaire
  },
  async (event) => {
    try {
      // Récupérer tous les abonnés depuis Firestore
      const subscribersSnap = await db.collection("abonnés").get();
      if (subscribersSnap.empty) {
        console.log("Aucun abonné trouvé pour la newsletter");
        return;
      }

      const subscribers = subscribersSnap.docs.map((doc: { data: () => { (): any; new(): any; email: any; }; }) => doc.data().email) as string[];

      // Envoyer l'email à chaque abonné
      for (const email of subscribers) {
        await sendWeeklyRecipeEmail(email);
      }

      console.log("Emails de la recette de la semaine envoyés à tous les abonnés !");
    } catch (err) {
      console.error("Erreur dans le cron de la recette de la semaine :", err);
    }
  }
);
