/**
 * Données de recettes classiques françaises
 * à insérer dans Firestore
 *
 * NOTE: Les ingrédients sont définis par leur nom ici.
 * Ils seront convertis en IDs lors de l'insertion.
 */

// Interface pour les ingrédients (temporaire, avant conversion en IDs)
interface RecipeIngredient {
	name: string;
	quantity: string;
	unit: string;
}

interface RecipePart {
	title: string;
	ingredients: RecipeIngredient[];
	steps: string[];
}

interface RecipeData {
	title: string;
	type: string;
	preparationTime: number;
	cookingTime: number;
	position: string;
	recipeParts: RecipePart[];
	images: string[];
	video: string;
	titleKeywords: string[];
	url: string;
	createdBy: string;
	createdAt: Date;
}

export const recipesData: RecipeData[] = [
	{
		title: "Coq au Vin",
		type: "Plat",
		preparationTime: 20,
		cookingTime: 120,
		position: "21", // Côte-d'Or
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{ name: "Coq fermier", quantity: "1", unit: "pièce" },
					{ name: "Vin rouge de Bourgogne", quantity: "750", unit: "ml" },
					{ name: "Lardons", quantity: "150", unit: "g" },
					{ name: "Champignons de Paris", quantity: "250", unit: "g" },
					{ name: "Oignons grelots", quantity: "12", unit: "pièces" },
					{ name: "Ail", quantity: "3", unit: "gousses" },
					{ name: "Beurre", quantity: "50", unit: "g" },
					{ name: "Farine", quantity: "30", unit: "g" },
					{ name: "Bouillon de volaille", quantity: "250", unit: "ml" },
					{ name: "Thym", quantity: "1", unit: "branche" },
					{ name: "Laurier", quantity: "1", unit: "feuille" },
					{ name: "Sel et poivre", quantity: "À", unit: "goût" },
				],
				steps: [
					"Découper le coq en morceaux et le faire dorer dans un faitout avec le beurre",
					"Réserver le coq et faire revenir les lardons, oignons et champignons",
					"Saupoudrer de farine et bien mélanger",
					"Verser le vin rouge et le bouillon, remettre le coq",
					"Ajouter l'ail, le thym et le laurier",
					"Couvrir et laisser mijoter 2 heures",
					"Assaisonner et servir chaud",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["coq", "vin", "bourgogne", "plat", "viande"],
		url: "coq-au-vin",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Croissants Parisiens",
		type: "Dessert",
		preparationTime: 30,
		cookingTime: 25,
		position: "75", // Paris
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{ name: "Farine", quantity: "500", unit: "g" },
					{ name: "Lait tiède", quantity: "250", unit: "ml" },
					{ name: "Beurre pommade", quantity: "350", unit: "g" },
					{ name: "Sucre", quantity: "50", unit: "g" },
					{ name: "Sel", quantity: "10", unit: "g" },
					{ name: "Levure fraîche", quantity: "20", unit: "g" },
					{ name: "Œuf", quantity: "1", unit: "pièce" },
				],
				steps: [
					"Mélanger la farine, le sucre et le sel",
					"Diluer la levure dans le lait tiède et incorporer",
					"Ajouter l'œuf et mélanger jusqu'à obtenir une pâte souple",
					"Ajouter le beurre progressivement et pétrir",
					"Laisser reposer 1 heure",
					"Faire les tours de beurrage (6 tours de 2 plis)",
					"Laisser reposer entre chaque tour",
					"Façonner les croissants et laisser reposer 2 heures",
					"Dorer à l'œuf et cuire à 200°C pendant 25 minutes",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: [
			"croissants",
			"viennoiserie",
			"pain",
			"beurre",
			"pâtisserie",
		],
		url: "croissants-parisiens",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Bouillabaisse",
		type: "Plat",
		preparationTime: 30,
		cookingTime: 60,
		position: "13", // Marseille
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{
						name: "Poissons variés (rouget, St-Pierre, etc.)",
						quantity: "2",
						unit: "kg",
					},
					{ name: "Huile d'olive", quantity: "200", unit: "ml" },
					{ name: "Oignons", quantity: "3", unit: "pièces" },
					{ name: "Ail", quantity: "6", unit: "gousses" },
					{ name: "Tomates", quantity: "800", unit: "g" },
					{ name: "Fenouil", quantity: "1", unit: "bulbe" },
					{ name: "Zeste d'orange", quantity: "1", unit: "pincée" },
					{ name: "Safran", quantity: "1", unit: "pincée" },
					{ name: "Eau", quantity: "2", unit: "litre" },
					{ name: "Pain", quantity: "400", unit: "g" },
					{ name: "Rouille", quantity: "100", unit: "ml" },
				],
				steps: [
					"Faire un bouillon avec têtes et arêtes de poisson",
					"Chauffer l'huile d'olive et faire revenir oignons, ail et fenouil",
					"Ajouter tomates, zeste d'orange et safran",
					"Verser le bouillon et laisser mijoter 30 minutes",
					"Ajouter les poissons coupés en gros morceaux",
					"Laisser cuire 10 à 15 minutes",
					"Servir avec du pain grillé garni de rouille",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["bouillabaisse", "poisson", "provençale", "méditerranée"],
		url: "bouillabaisse",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Cassoulet Toulousain",
		type: "Plat",
		preparationTime: 30,
		cookingTime: 180,
		position: "31", // Toulouse
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{ name: "Haricots blancs secs", quantity: "500", unit: "g" },
					{ name: "Confit de canard", quantity: "4", unit: "parts" },
					{ name: "Saucisse de Toulouse", quantity: "400", unit: "g" },
					{ name: "Poitrine de porc salée", quantity: "300", unit: "g" },
					{ name: "Oignons", quantity: "2", unit: "pièces" },
					{ name: "Ail", quantity: "4", unit: "gousses" },
					{ name: "Bouquet garni", quantity: "1", unit: "pièce" },
					{ name: "Huile d'olive", quantity: "100", unit: "ml" },
					{ name: "Pain rassis", quantity: "200", unit: "g" },
				],
				steps: [
					"Faire tremper les haricots 12 heures",
					"Cuire les haricots avec oignons, ail et bouquet garni",
					"Faire fondre le confit de canard à feu doux",
					"Cuire les saucisses et la poitrine séparément",
					"Dans une cocotte, alterner haricots et viandes",
					"Recouvrir avec le bouillon de cuisson des haricots",
					"Couvrir avec du pain rassis imbibé d'huile d'olive",
					"Cuire à 180°C pendant 1h30, puis augmenter à 220°C les 15 dernières minutes",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["cassoulet", "toulouse", "canard", "plat", "confit"],
		url: "cassoulet-toulousain",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Tarte aux Fraises",
		type: "Dessert",
		preparationTime: 40,
		cookingTime: 30,
		position: "92", // Hauts-de-Seine
		recipeParts: [
			{
				title: "Ingrédients Pâte",
				ingredients: [
					{ name: "Farine", quantity: "250", unit: "g" },
					{ name: "Beurre froid", quantity: "125", unit: "g" },
					{ name: "Sucre glace", quantity: "50", unit: "g" },
					{ name: "Œuf", quantity: "1", unit: "pièce" },
					{ name: "Sel", quantity: "1", unit: "pincée" },
				],
				steps: [
					"Mélanger farine et sel",
					"Ajouter beurre froid coupé en dés et frotter",
					"Ajouter sucre glace et œuf",
					"Former une boule et laisser reposer 30 minutes",
					"Étaler et garnir un moule",
					"Cuire à blanc 15 minutes à 200°C",
				],
			},
			{
				title: "Ingrédients Crème",
				ingredients: [
					{ name: "Lait", quantity: "500", unit: "ml" },
					{ name: "Jaunes d'œufs", quantity: "4", unit: "pièces" },
					{ name: "Sucre", quantity: "100", unit: "g" },
					{ name: "Farine", quantity: "40", unit: "g" },
					{ name: "Beurre", quantity: "30", unit: "g" },
					{ name: "Vanille", quantity: "1", unit: "gousse" },
					{ name: "Fraises", quantity: "500", unit: "g" },
				],
				steps: [
					"Chauffer le lait avec la vanille",
					"Mélanger jaunes d'œufs et sucre jusqu'à blanchir",
					"Ajouter farine progressivement",
					"Verser le lait bouillant en fouettant",
					"Cuire 2 minutes, ajouter beurre",
					"Garnir la pâte de crème",
					"Disposer les fraises préalablement lavées et équeutées",
					"Servir frais",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["tarte", "fraises", "dessert", "pâtisserie", "crème"],
		url: "tarte-aux-fraises",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Sole Meunière",
		type: "Plat",
		preparationTime: 15,
		cookingTime: 15,
		position: "14", // Normandie
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{ name: "Sole", quantity: "4", unit: "filets" },
					{ name: "Lait", quantity: "250", unit: "ml" },
					{ name: "Farine", quantity: "100", unit: "g" },
					{ name: "Beurre", quantity: "150", unit: "g" },
					{ name: "Citron frais", quantity: "2", unit: "pièces" },
					{ name: "Persil frais", quantity: "1", unit: "bouquet" },
					{ name: "Sel et poivre", quantity: "À", unit: "goût" },
				],
				steps: [
					"Tremper les filets de sole dans le lait",
					"Enrober de farine",
					"Faire chauffer 100g de beurre dans une poêle",
					"Cuire les filets 3 à 4 minutes de chaque côté",
					"Réserver au chaud",
					"Faire mousser 50g de beurre frais en casserole",
					"Verser le beurre noisette sur les filets",
					"Ajouter le jus de citron frais et le persil",
					"Servir immédiatement",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["sole", "poisson", "meunière", "beurre", "normandie"],
		url: "sole-meuniere",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Onion Soup à la Française",
		type: "Entrée",
		preparationTime: 20,
		cookingTime: 45,
		position: "75", // Paris
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{ name: "Oignons", quantity: "800", unit: "g" },
					{ name: "Beurre", quantity: "50", unit: "g" },
					{ name: "Huile d'olive", quantity: "2", unit: "cuillère à soupe" },
					{ name: "Bouillon de bœuf", quantity: "1.5", unit: "litre" },
					{ name: "Vin blanc sec", quantity: "100", unit: "ml" },
					{ name: "Pain", quantity: "200", unit: "g" },
					{ name: "Gruyère râpé", quantity: "150", unit: "g" },
					{ name: "Sel et poivre", quantity: "À", unit: "goût" },
				],
				steps: [
					"Émincer finement les oignons",
					"Chauffer beurre et huile d'olive dans une cocotte",
					"Faire caraméliser les oignons pendant 30 minutes à feu moyen-doux",
					"Ajouter le vin blanc et laisser réduire",
					"Verser le bouillon et assaisonner",
					"Laisser mijoter 15 minutes",
					"Griller les tranches de pain et les garnir de gruyère",
					"Verser la soupe dans les bols",
					"Ajouter le pain gratinéé sur le dessus",
					"Faire gratiner au four quelques minutes",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["soupe", "oignon", "gratinée", "entrée", "française"],
		url: "onion-soup-francaise",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Clafoutis aux Cerises",
		type: "Dessert",
		preparationTime: 20,
		cookingTime: 40,
		position: "19", // Corrèze
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{ name: "Cerises fraîches", quantity: "500", unit: "g" },
					{ name: "Œufs", quantity: "4", unit: "pièces" },
					{ name: "Lait", quantity: "300", unit: "ml" },
					{ name: "Farine", quantity: "100", unit: "g" },
					{ name: "Sucre", quantity: "100", unit: "g" },
					{ name: "Beurre fondu", quantity: "50", unit: "g" },
					{ name: "Sucre glace", quantity: "30", unit: "g" },
					{ name: "Sel", quantity: "1", unit: "pincée" },
				],
				steps: [
					"Équeuter les cerises et répartir dans un moule beurré",
					"Mélanger œufs et sucre jusqu'à blanchissement",
					"Ajouter farine et sel, mélanger",
					"Ajouter lait progressivement en fouettant",
					"Incorporer beurre fondu",
					"Verser la pâte sur les cerises",
					"Cuire à 180°C pendant 40 minutes",
					"Saupoudrer de sucre glace chaud à la sortie du four",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["clafoutis", "cerises", "dessert", "corrèze", "fruit"],
		url: "clafoutis-cerises",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Pot-au-Feu",
		type: "Plat",
		preparationTime: 30,
		cookingTime: 180,
		position: "75", // Paris
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{
						name: "Viande de bœuf (gîte, jumeau)",
						quantity: "1.5",
						unit: "kg",
					},
					{ name: "Carottes", quantity: "6", unit: "pièces" },
					{ name: "Navets", quantity: "4", unit: "pièces" },
					{ name: "Poireaux", quantity: "4", unit: "pièces" },
					{ name: "Oignons", quantity: "2", unit: "pièces" },
					{ name: "Clous de girofle", quantity: "2", unit: "pièces" },
					{ name: "Bouquet garni", quantity: "1", unit: "pièce" },
					{ name: "Sel et poivre", quantity: "À", unit: "goût" },
					{ name: "Eau", quantity: "2.5", unit: "litre" },
				],
				steps: [
					"Mettre la viande dans l'eau bouillante et laisser cuire 30 minutes",
					"Écumer régulièrement",
					"Ajouter oignons piqués de clous de girofle et bouquet garni",
					"Ajouter carottes, navets et poireaux",
					"Laisser cuire 1h30 à 2h à petit frémissement",
					"La viande doit être très tendre",
					"Servir la viande avec les légumes et le bouillon",
					"Accompagner de cornichons et moutarde",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["pot-au-feu", "bœuf", "légumes", "plat", "français"],
		url: "pot-au-feu",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
	{
		title: "Crème Brûlée",
		type: "Dessert",
		preparationTime: 30,
		cookingTime: 40,
		position: "75", // Paris
		recipeParts: [
			{
				title: "Ingrédients",
				ingredients: [
					{ name: "Lait entier", quantity: "500", unit: "ml" },
					{ name: "Crème fraîche", quantity: "250", unit: "ml" },
					{ name: "Jaunes d'œufs", quantity: "5", unit: "pièces" },
					{ name: "Sucre", quantity: "100", unit: "g" },
					{ name: "Sucre cassonade", quantity: "50", unit: "g" },
					{ name: "Vanille", quantity: "1", unit: "gousse" },
				],
				steps: [
					"Chauffer lait et crème avec la gousse de vanille fendue",
					"Retirer du feu et laisser infuser 15 minutes",
					"Mélanger jaunes d'œufs et sucre jusqu'à blanchir",
					"Verser lait tiède en fouettant",
					"Passer au tamis",
					"Verser dans des ramequins",
					"Cuire au bain-marie à 160°C pendant 30-40 minutes",
					"Laisser refroidir complètement puis réfrigérer 4 heures",
					"Avant de servir, saupoudrer de cassonade et caraméliser au chalumeau",
				],
			},
		],
		images: [],
		video: "",
		titleKeywords: ["crème brûlée", "dessert", "vanille", "caramel", "élégant"],
		url: "creme-brulee",
		createdBy: "v3U4ANeEKFXzqHqz7rLWa9G0Ybn2",
		createdAt: new Date(),
	},
];
