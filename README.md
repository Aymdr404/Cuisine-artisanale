# Cuisine Artisanale 🍳

Une application web moderne pour partager et découvrir des recettes artisanales françaises.

## 🌟 Fonctionnalités

- **Recettes Authentiques** : Partagez et découvrez des recettes traditionnelles françaises
- **Géolocalisation** : Associez vos recettes à leur département d'origine
- **Gestion des Ingrédients** : Système complet de gestion des ingrédients avec quantités et unités
- **Interface Moderne** : Design responsive et intuitif
- **Authentification** : Système de connexion et gestion des rôles (admin/utilisateur)
- **Modération** : Système de modération des recettes par les administrateurs
- **Médias** : Support pour les images et vidéos dans les recettes

## 🛠️ Technologies Utilisées

- **Frontend** :
  - React 18
  - TypeScript
  - Vite
  - PrimeReact (UI Components)
  - CSS Modules

- **Backend** :
  - Firebase
    - Authentication
    - Firestore
    - Storage

## 🚀 Installation

1. Clonez le repository :
```bash
git clone https://github.com/votre-username/Cuisine-artisanale.git
cd Cuisine-artisanale
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env` à la racine du projet avec les variables Firebase nécessaires :
```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

4. Lancez l'application en mode développement :
```bash
npm run dev
```

## 📝 Structure du Projet

```
src/
├── components/         # Composants réutilisables
├── contexts/          # Contextes React (Auth, etc.)
├── pages/            # Pages de l'application
├── services/         # Services (Firebase, etc.)
├── styles/           # Styles globaux
└── types/            # Types TypeScript
```

## 🔑 Fonctionnalités Principales

### Gestion des Recettes
- Création de recettes avec étapes détaillées
- Gestion des ingrédients avec quantités et unités
- Support pour les images et vidéos
- Association avec les départements français

### Système de Modération
- Validation des recettes par les administrateurs
- Gestion de la visibilité des recettes
- Système de signalement

### Interface Utilisateur
- Design responsive
- Thème clair/sombre
- Navigation intuitive
- Filtres et recherche

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Sabatier aymeric - Développeur Principal

## 🙏 Remerciements

- PrimeReact pour les composants UI
- Firebase pour l'infrastructure backend
- La communauté open source

---

Made with ❤️ in France
