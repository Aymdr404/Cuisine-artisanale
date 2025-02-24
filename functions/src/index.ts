import { onDocumentUpdated } from "firebase-functions/v2/firestore";
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

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
