"use client";
import React, { useEffect, useState, useRef } from 'react';
import './RecetteDesc.css';
import VideoEmbed from '@components/VideoEmbed/VideoEmbed';

import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, deleteDoc, onSnapshot, query, where, getDocs, collection, orderBy, serverTimestamp, addDoc } from '@firebase/firestore';
import { db } from '@firebaseModule';
import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { toggleLikeRecipes, unlikeRecipes } from '@/services/RecetteService/RecetteService';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { useToast } from '@/contexts/ToastContext/ToastContext';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';

interface RecipePart {
  title: string;
  steps: string[];
  ingredients: Ingredient[];
}

interface Recette {
  id: string;
  title: string;
  type: string;
  cookingTime: number;
  preparationTime: number;
  recipeParts: RecipePart[];
  video?: string;
  position: string;
  images?: string[];
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

const RecetteDesc: React.FC = () => {
	const [id, setId] = useState<string | null>(null);
	const params = useParams();
	const recipeName = typeof params?.recipeName === 'string' ? params.recipeName : Array.isArray(params?.recipeName) ? params.recipeName[0] : undefined;
	const router = useRouter();
	const {role, user} = useAuth();
	const { showToast } = useToast();
	const [likes, setLikes] = useState<string[]>([]);
	const userId = user?.uid;

	const hasLiked = userId ? likes.includes(userId) : false;
	const [recette, setRecette] = React.useState<Recette | null>(null);
	const [departements, setDepartements] = useState<Map<string, string>>(new Map());
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const [reviews, setReviews] = useState<any[]>([]);
	const [newReview, setNewReview] = useState('');
	const [newRating, setNewRating] = useState<number | null>(null);


	const getRecette = async (recipeName: string) => {
		const recettesCollection = collection(db, "recipes");
		const q = query(recettesCollection, where("url", "==", recipeName));
		try {
			const querySnapshot = await getDocs(q);
			if (querySnapshot.empty) {
				console.log("Pas de recette trouvée avec ce nom");
				return;
			}

			const recetteDoc = querySnapshot.docs[0];
			const recetteData = recetteDoc.data() as Recette;
			setId(recetteDoc.id);

			// Traitement des ingrédients pour chaque partie
			const updatedRecipeParts = await Promise.all(
				recetteData.recipeParts.map(async (part) => {
				const ingredientsDetails = await Promise.all(
					part.ingredients.map(async (ingredient) => {
					const ingredientRef = doc(db, 'ingredients', ingredient.id);
					const ingredientSnap = await getDoc(ingredientRef);

					if (ingredientSnap.exists()) {
						const ingredientData = ingredientSnap.data();
						return {
						id: ingredient.id,
						name: ingredientData.name,
						quantity: ingredient.quantity,
						unit: ingredientData.unit,
						};
					} else {
						console.warn(`Ingrédient avec l'ID ${ingredient.id} introuvable`);
						return null;
					}
					})
				);

				const filteredIngredients = ingredientsDetails.filter((ing) => ing !== null);
				return {
					...part,
					ingredients: filteredIngredients
				};
				})
			);

			setRecette({ ...recetteData, recipeParts: updatedRecipeParts });
		} catch (error) {
			console.error("Erreur lors de la récupération de la recette :", error);
		}
	};

	useEffect(() => {
		if (recipeName){
			getRecette(recipeName);
		}
	}, [recipeName]);

	useEffect(() => {
		fetch("https://geo.api.gouv.fr/departements")
			.then(res => res.json())
			.then(data => {
				const departementMap: Map<string, string> = new Map(data.map((dep: { code: string; nom: string }) => [dep.code, dep.nom]));
				setDepartements(departementMap);
			});
	}, []);


	useEffect(() => {
		if (id) {
			const unsubscribe = onSnapshot(doc(db, "recipes", id), (docSnapshot) => {
				if (docSnapshot.exists()) {
					setLikes(docSnapshot.data().likes || []);
				}
			});
		return () => unsubscribe();
		}
	}, [id]);

	useEffect(() => {
		if (recette?.images && recette.images.length > 1) {
			intervalRef.current = setInterval(() => {
				setCurrentImageIndex((prevIndex) =>
				prevIndex === (recette?.images?.length ?? 0) - 1 ? 0 : prevIndex + 1
				);
			}, 5000);
		}
		return () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		};
	}, [recette?.images]);

	useEffect(() => {
		if (!recette) return;

		const structuredData = {
			"@context": "https://schema.org",
			"@type": "Recipe",
			"name": recette.title,
			"image": recette.images?.[0] || "",
			"author": {
			"@type": "Person",
			"name": user?.displayName || "Auteur inconnu"
			},
			"recipeCuisine": departements.get(recette.position) || "France",
			"recipeCategory": recette.type,
			"prepTime": `PT${recette.preparationTime}M`,
			"cookTime": `PT${recette.cookingTime}M`,
			"recipeIngredient": recette.recipeParts.flatMap(part =>
			part.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`)
			),
			"recipeInstructions": recette.recipeParts.flatMap(part =>
			part.steps.map(step => ({
				"@type": "HowToStep",
				"text": step
			}))
			),
			"video": recette.video
			? {
				"@type": "VideoObject",
				"name": recette.title,
				"description": `Vidéo de la recette ${recette.title}`,
				"thumbnailUrl": recette.images?.[0] || "",
				"uploadDate": new Date().toISOString(),
				"contentUrl": recette.video
				}
			: undefined
		};

		// Supprime tout ancien script JSON-LD
		const oldScript = document.getElementById("jsonld-recipe");
		if (oldScript) oldScript.remove();

		// Crée et insère le nouveau script
		const script = document.createElement("script");
		script.id = "jsonld-recipe";
		script.type = "application/ld+json";
		script.innerHTML = JSON.stringify(structuredData);
		document.head.appendChild(script);

		return () => {
			const existing = document.getElementById("jsonld-recipe");
			if (existing) existing.remove();
		};
	}, [recette, departements]);

	useEffect(() => {
		if (!id) return;

		const reviewsRef = collection(db, "reviews");
		const q = query(reviewsRef, where("recipeId", "==", id), orderBy("createdAt", "desc"));

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const fetchedReviews = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
			}));
			setReviews(fetchedReviews);
		});

		return () => unsubscribe();
	}, [id]);


	const handleImageClick = (index: number) => {
		setCurrentImageIndex(index);
		if (intervalRef.current) {
		clearInterval(intervalRef.current);
		}
	};

	const handleDelete = async () => {
		if (!id) return;
		try {
			await deleteDoc(doc(db, "recipes", id));
			showToast({
				severity: 'success',
				summary: 'Succès',
				detail: 'Recette supprimée avec succès'
			});
			navigate('/recettes');
		} catch (error) {
			console.error("Erreur lors de la suppression de la recette :", error);
			showToast({
				severity: 'error',
				summary: 'Erreur',
				detail: 'Erreur lors de la suppression de la recette'
			});
		}
	};

	const confirmDelete = () => {
		confirmDialog({
			message: 'Êtes-vous sûr de vouloir supprimer cette recette ?',
			header: 'Confirmation de suppression',
			icon: 'pi pi-exclamation-triangle',
			accept: handleDelete,
			reject: () => {}
		});
	};

	const handleLike = async () => {
		if (!userId) {
			showToast({
				severity: 'warn',
				summary: 'Connexion requise',
				detail: 'Vous devez être connecté pour aimer une recette'
			});
			return;
		}
		if (!id) {
			showToast({
				severity: 'error',
				summary: 'Erreur',
				detail: 'Impossible de trouver la recette'
			});
			return;
		}
		try {
			if (hasLiked) {
				await unlikeRecipes(id, userId);
			} else {
				await toggleLikeRecipes(id, userId);
			}
		} catch (error) {
			console.error("Erreur lors du like:", error);
			showToast({
				severity: 'error',
				summary: 'Erreur',
				detail: 'Une erreur est survenue lors du like'
			});
		}
	};

  	const handleAddReview = async () => {
		if (!userId) {
			showToast({
				severity: 'warn',
				summary: 'Connexion requise',
				detail: 'Connectez-vous pour laisser un avis'
			});
			return;
		}

		if (!id || !newReview.trim() || !newRating) {
			showToast({
				severity: 'warn',
				summary: 'Champs manquants',
				detail: 'Ajoutez une note et un message'
			});
			return;
		}

		try {
			const reviewsRef = collection(db, "reviews");
			await addDoc(reviewsRef, {
				recipeId: id,
				userId,
				userName: user?.displayName || "Utilisateur",
				message: newReview.trim(),
				rating: newRating,
				createdAt: serverTimestamp(),
			});

			setNewReview('');
			setNewRating(null);
			showToast({
				severity: 'success',
				summary: 'Merci !',
				detail: 'Votre avis a été ajouté'
			});
		} catch (error) {
			console.error("Erreur lors de l'ajout de l'avis :", error);
			showToast({
				severity: 'error',
				summary: 'Erreur',
				detail: 'Impossible d’ajouter l’avis'
			});
		}
	};

	const averageRating = reviews.length > 0	? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

	const deleteReview = async (id: string) => {
		try {
			await deleteDoc(doc(db, "reviews", id));
			setReviews((prev) => prev.filter((review) => review.id !== id));

			showToast({
				severity: 'success',
				summary: 'Suppr',
				detail: 'Avis supprimer'
			})
		} catch (error) {
			showToast({
				severity: 'error',
				summary: 'Erreur',
				detail: 'Avis pas supprimer'
			})
		}
	};

  return (
	<>
		<div className="RecetteDesc">
			<ConfirmDialog />
			<div className="recette-desc-button-container">
				<div className="recette-desc-button-container-left">
					<Button
						icon="pi pi-arrow-left"
						onClick={() => router.back()}
						className="p-button-text"
					/>
					<Button
						icon="pi pi-home"
						onClick={() => router.push("/")}
						className="p-button-text"
					/>
					<Button
						icon={hasLiked ? 'pi pi-heart-fill' : 'pi pi-heart'}
						onClick={handleLike}
						className="p-button-text"
						severity={hasLiked ? 'danger' : 'info'}
					/>
					<Button
						icon="pi pi-share-alt"
						onClick={() => {
							if (navigator.share) {
							navigator.share({
								title: recette?.title,
								text: `Découvrez la recette ${recette?.title} sur Cuisine Artisanale`,
								url: `https://www.aymeric-sabatier.fr/Cuisine-artisanale/share/${recipeName}`
							});
							} else {
							navigator.clipboard.writeText(window.location.href);
							showToast({
								severity: 'info',
								summary: 'Lien copié',
								detail: 'Lien de la recette copié dans le presse-papiers',
							});
							}
						}}
					/>
					</div>
				{role === 'admin' && (
				<div className="recette-desc-admin-buttons">
					<Button
						icon="pi pi-pencil"
						onClick={() => router.push(`/recettes/${id}/edit`)}
						className="p-button-text"
					/>
					<Button
						icon="pi pi-trash"
						onClick={confirmDelete}
						className="p-button-text p-button-danger"
					/>
				</div>
				)}
			</div>

			<h1 className="recette-desc-title">{recette?.title}</h1>

			<div className="recette-desc-description">
				<div className="recette-desc-info">
				<div className="recette-desc-info-left">
					<p>
					<strong>Type:</strong> {recette?.type}
					</p>
					{recette?.position && (
					<div className="recette-desc-position">
						<p>
						<strong>Departement:</strong> {departements.get(recette.position) || "Inconnu"}
						</p>
					</div>
					)}
					<div className="recette-desc-timing">
					<p>
						<i className="pi pi-clock"></i>
						<strong>Temps de préparation:</strong> {recette?.preparationTime} min
					</p>
					<p>
						<i className="pi pi-hourglass"></i>
						<strong>Temps de cuisson:</strong> {recette?.cookingTime} min
					</p>
					</div>
					{recette?.video && (
					<h3 className='recette-desc-video'>
						<strong>Vidéo associée :</strong>
						<VideoEmbed url={recette.video} />
					</h3>
					)}
				</div>
				<div className="recette-desc-info-right">
					{recette?.images && recette.images.length > 0 && (
					<div className="recette-desc-gallery">
						<div className="recette-desc-main-image">
						<img
							src={recette.images[currentImageIndex]}
							alt={`${recette.title} - Image ${currentImageIndex + 1}`}
						/>
						</div>
						{recette.images.length > 1 && (
						<div className="recette-desc-thumbnails">
							{recette.images.map((image, index) => (
							<div
								key={index}
								className={`recette-desc-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
								onClick={() => handleImageClick(index)}
							>
								<img
								src={image}
								alt={`${recette.title} - Thumbnail ${index + 1}`}
								/>
							</div>
							))}
						</div>
						)}
					</div>
					)}
				</div>
				</div>
				{recette?.recipeParts.map((part, index) => (
				<div key={index} className="recette-desc-part">
					<h2>{part.title}</h2>
					<section>
					<div className="recette-desc-part-ingredients">
						<h3>Ingrédients</h3>
						<ul>
						{part.ingredients.map((ingredient, idx) => (
							<li key={idx}>
							<p>
								{ingredient.name} - {ingredient.quantity} {ingredient.unit}
							</p>
							</li>
						))}
						</ul>
					</div>

					<div className="recette-desc-part-steps">
						<h3>Étapes de préparation</h3>
						<ol>
						{part.steps.map((step, idx) => (
							<li key={idx}>
							<h4>{step}</h4>
							</li>
						))}
						</ol>
					</div>
					</section>
				</div>
				))}
			</div>
			<div className="recette-reviews-section">
				<section className="recette-reviews-header">
					<h2>Notes et avis</h2>
					{averageRating && (
					<div className="recette-average-rating">
						<Rating value={parseFloat(averageRating)} readOnly cancel={false} />
						<span>{averageRating} / 5 ({reviews.length} avis)</span>
					</div>
					)}
					<div className="recette-review-form">
						<h3>Laisser un avis</h3>
						<Rating value={newRating ?? undefined} onChange={(e) => setNewRating(e.value ?? null)} cancel={false} />
						<InputTextarea
							value={newReview}
							onChange={(e) => setNewReview(e.target.value)}
							rows={4}
							cols={40}
							placeholder="Votre message..."
						/>
						<Button
							label="Envoyer"
							icon="pi pi-send"
							onClick={handleAddReview}
							className="mt-2"
							disabled={!user}
						/>
						{!user && (<h3>Connectez vous pour laisser un avis</h3>)}
					</div>
				</section>

				{reviews.length === 0 && <p>Aucun avis pour le moment.</p>}
				<ul className="recette-reviews-list">
					{reviews.map((r) => (
						<li key={r.id} className="recette-review">
							<div className="recette-review-header">
								<strong>{r.userName}</strong>
								<Rating value={r.rating} readOnly cancel={false} />
								{user && role == "admin" && (
									<div>
										<Button
											icon="pi pi-trash"
											onClick={() => deleteReview(r.id!)}
											className="p-button-danger p-button-rounded"
											tooltip="Supprimer l'avis"
										/>
									</div>
								)}
							</div>
							<p>{r.message}</p>
							<small>{r.createdAt?.toDate?.().toLocaleString?.() || ''}</small>
						</li>
					))}
				</ul>
			</div>
		</div>
	</>
  );
};

export default RecetteDesc;
