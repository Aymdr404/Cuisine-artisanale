"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Filtre from '@components/Filtre/Filtre';
import Recette from '@components/Recette/Recette';
import AddRecette from '@components/AddRecette/AddRecette';
import SkeletonLoader from '@components/SkeletonLoader/SkeletonLoader';

import { db } from '@firebaseModule';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';


interface RecetteData {
	recetteId: string;
	title: string;
	type: string;
	images?: string[];
	position: string;
	score?: number;
}

const Recettes: React.FC = () => {

	const [displayedRecettes, setDisplayedRecettes] = useState<RecetteData[]>([]);
	const [allRecettes, setAllRecettes] = useState<RecetteData[]>([]);
	const searchParams = useSearchParams();
	const [departements, setDepartements] = useState<Map<string, string>>(new Map());
	const [itemsPerPage] = useState(12);
	const [currentPage, setCurrentPage] = useState(0);
	const observerTarget = useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setCurrentPage(0);
		setDisplayedRecettes([]);
		fetchRecettes();
	}, [searchParams.toString()]);


	function generateWordVariants(word: string): string[] {
		const base = word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // supprime les accents
		const variants = new Set<string>([base]);

		// Gérer pluriels simples
		if (base.endsWith("s")) variants.add(base.slice(0, -1));
		else variants.add(base + "s");

		// Gérer quelques formes simples de fautes
		if (base.endsWith("ie")) variants.add(base.slice(0, -2) + "y");
		if (base.endsWith("y")) variants.add(base.slice(0, -1) + "ie");

		return Array.from(variants);
	}

	function levenshtein(a: string, b: string): number {
		const m = a.length;
		const n = b.length;
		const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

		for (let i = 0; i <= m; i++) dp[i][0] = i;
		for (let j = 0; j <= n; j++) dp[0][j] = j;

		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			dp[i][j] = Math.min(
				dp[i - 1][j] + 1, // suppression
				dp[i][j - 1] + 1, // insertion
				dp[i - 1][j - 1] + cost // remplacement
			);
			}
		}
		return dp[m][n];
	}

	function similarity(a: string, b: string): number {
		const maxLen = Math.max(a.length, b.length);
		return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen;
	}


	const fetchRecettes = async () => {
		try {
			const recettesCollection = collection(db, "recipes");

			const type = searchParams.get("type");
			const position = searchParams.get("position");
			const keywords = searchParams.get("keywords");

			let allRecettesMap = new Map<string, RecetteData>();

			if (keywords) {
				const words = keywords.split(" ");
				for (const word of words) {
					const variants = generateWordVariants(word);
					if (variants.length === 0) continue;
					let found = false;

					console.log();
					const wordQuery = query(
						recettesCollection,
						where("titleKeywords", "array-contains-any", variants)
					);

					const querySnapshot = await getDocs(wordQuery);

					if (querySnapshot.empty) {
						console.log("⚠️ Aucun résultat Firestore pour :", variants);
					}
					if (!querySnapshot.empty) found = true;

					querySnapshot.forEach((doc) => {
						const data = doc.data();
						allRecettesMap.set(doc.id, {
						title: data.title,
						type: data.type,
						position: data.position,
						recetteId: doc.id,
						images: data.images ?? [],
						});
					});

					// Étape 2 : Fallback fuzzy si Firestore n'a rien trouvé
					if (!found) {
						console.log(`⚠️ Aucun match Firestore pour "${word}", fallback fuzzy`);
						const allDocs = await getDocs(recettesCollection);
						allDocs.forEach((doc) => {
							const data = doc.data();
							allRecettesMap.set(doc.id, {
							title: data.title,
							type: data.type,
							position: data.position,
							recetteId: doc.id,
							images: data.images ?? [],
							});
						});
					}
				}
			} else {
				// Aucun mot-clé → récupérer tout
				const querySnapshot = await getDocs(recettesCollection);
				querySnapshot.forEach((doc) => {
					const data = doc.data();
					allRecettesMap.set(doc.id, {
					title: data.title,
					type: data.type,
					position: data.position,
					recetteId: doc.id,
					images: data.images ?? [],
					});
				});
			}

			let recettesData = Array.from(allRecettesMap.values());
			if (keywords) {
				const cleanedKeywords = keywords.toLowerCase().split(" ");
				const SIMILARITY_THRESHOLD = 0.6;

				recettesData = recettesData
					.map((r) => {
					const title = r.title.toLowerCase();
					const maxScore = Math.max(
						...cleanedKeywords.map((k) => similarity(k, title))
					);
					return { ...r, score: maxScore };
					})
					.filter(
					(r) =>
						r.score >= SIMILARITY_THRESHOLD ||
						cleanedKeywords.some((k) => r.title.toLowerCase().includes(k))
					)
					.sort((a, b) => (b.score || 0) - (a.score || 0));

				console.log("Résultats filtrés :", recettesData);
			}

			// Filtrer selon le type et la position après récupération
			if (type) {
				recettesData = recettesData.filter((r) => r.type === type);
			}
			if (position) {
				recettesData = recettesData.filter((r) => r.position === position);
			}

			setAllRecettes(recettesData);
			setCurrentPage(0);
			setDisplayedRecettes(recettesData.slice(0, itemsPerPage));
		} catch (error) {
			console.error("Error getting recettes: ", error);
		}
	};

	// Charger plus de recettes au scroll
	const loadMoreRecettes = useCallback(() => {
		if (isLoading) return;

		const nextPage = currentPage + 1;
		const startIdx = nextPage * itemsPerPage;
		const endIdx = startIdx + itemsPerPage;

		if (startIdx < allRecettes.length) {
			setIsLoading(true);
			// Simuler un délai pour le chargement
			setTimeout(() => {
				setDisplayedRecettes((prev) => [...prev, ...allRecettes.slice(startIdx, endIdx)]);
				setCurrentPage(nextPage);
				setIsLoading(false);
			}, 300);
		}
	}, [currentPage, allRecettes, itemsPerPage, isLoading]);

	// Intersection Observer pour le infinite scroll
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading && currentPage * itemsPerPage + itemsPerPage < allRecettes.length) {
					loadMoreRecettes();
				}
			},
			{ threshold: 0.1 }
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => {
			if (observerTarget.current) {
				observer.unobserve(observerTarget.current);
			}
		};
	}, [loadMoreRecettes, isLoading, currentPage, allRecettes.length, itemsPerPage]);

	useEffect(() => {
		fetch("https://geo.api.gouv.fr/departements")
		.then(res => res.json())
		.then(data => {
			const departementMap: Map<string, string> = new Map(data.map((dep: { code: string; nom: string }) => [dep.code, dep.nom]));
			setDepartements(departementMap);
		});
	}, []);


	return (
		<div className="Recettes">
			<section className='filter_section'>
				<Filtre />
				<AddRecette />
			</section>
			<section className='recettes_section'>
				{displayedRecettes.length === 0 && allRecettes.length === 0 && (
					Array.from({ length: 6 }).map((_, i) => (
						<SkeletonLoader key={i} type="recipe-card" />
					))
				)}

				{displayedRecettes.map((recette, index) => (
					<Recette
						key={index}
						recetteId={recette.recetteId}
						title={recette.title}
						type={recette.type}
						images={recette.images}
						position={departements.get(recette.position) || "Inconnu"}
					/>
				))}

				{isLoading && (
					Array.from({ length: 3 }).map((_, i) => (
						<SkeletonLoader key={`loading-${i}`} type="recipe-card" />
					))
				)}

				{/* Observer target pour infinite scroll */}
				<div ref={observerTarget} style={{ height: '50px', marginTop: '20px' }} />
			</section>
		</div>
	);
};

export default Recettes;
