import { Suspense } from "react";
import RecettesWrapper from "./RecettesWrapper";
import "./recettes-page.css";

export const metadata = {
	title: "Recettes | Cuisine artisanale",
	description: "Parcourez toutes les recettes par type, mots-clés et département.",
};

export default function Page() {
	return (
		<Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Chargement...</div>}>
			<RecettesWrapper />
		</Suspense>
	);
}


