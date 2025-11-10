import { Suspense } from "react";
import Recettes from "@/pages-legacy/Recettes/Recettes";

export const metadata = {
	title: "Recettes | Cuisine artisanale",
	description: "Parcourez toutes les recettes par type, mots-clés et département.",
};

export default function Page() {
	return (
		<Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Chargement...</div>}>
			<Recettes />
		</Suspense>
	);
}


