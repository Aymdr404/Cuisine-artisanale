'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Recettes from '@/pages-legacy/Recettes/Recettes';
import RecetteDesc from '@/components/RecetteDesc/RecetteDesc';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import '@/components/Breadcrumb/Breadcrumb.css';

export default function RecettesWrapper() {
	const searchParams = useSearchParams();
	const recipeId = searchParams?.get('id');

	return (
		<div>
			<Breadcrumb />
			<Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>}>
				{recipeId ? <RecetteDesc /> : <Recettes />}
			</Suspense>
		</div>
	);
}
