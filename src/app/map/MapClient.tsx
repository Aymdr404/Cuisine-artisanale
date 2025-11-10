"use client";

// Vérifier que window existe avant d'importer
if (typeof window === 'undefined') {
	module.exports = () => <div>Chargement...</div>;
} else {
	const dynamic = require('next/dynamic').default;

	const RecetteMap = dynamic(() => import("@/pages-legacy/RecetteMap/RecetteMap"), {
		ssr: false,
		loading: () => <div style={{ padding: "2rem", textAlign: "center" }}>Chargement de la carte...</div>,
	});

	module.exports = function MapClient() {
		return <RecetteMap />;
	};
}


