import { Suspense } from 'react';
import UserProfileWrapper from '@/pages-legacy/UserProfile/UserProfileWrapper';

export const metadata = {
  title: 'Profil Utilisateur | Cuisine Artisanale',
  description: 'Voir le profil public d\'un utilisateur et ses recettes créées',
};

export default function ProfilPage() {
  return (
	<Suspense fallback={<div>Chargement du profil...</div>}>
	  <UserProfileWrapper />
	</Suspense>
  );
}
