import React, { Suspense } from 'react';
import Actualites from '@/pages-legacy/Actualites/Actualites';
import TrendingRecipes from '@/components/TrendingRecipes/TrendingRecipes';

const Posts = React.lazy(() => import('@/pages-legacy/Posts/Posts'));

export const metadata = {
	title: 'Accueil | Cuisine artisanale',
	description: 'Actualités et derniers posts sur la cuisine artisanale.',
};

export default function Page() {
	return (
		<div className="Home">
			<Actualites />
			<TrendingRecipes />
			<Suspense fallback={<div className="posts-skeleton">Chargement des posts...</div>}>
				<Posts />
			</Suspense>
		</div>
	);
}


