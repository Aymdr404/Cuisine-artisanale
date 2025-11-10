import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Providers from './providers';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '@/styles/theme.css';
import '@/styles/admin.css';
import '@/styles/dialog.css';
import '@/styles/toast.css';
import '@/index.css';
import Navbar from '@/components/Navbar/Navbar';
import LegalMention from '@/components/LegalMention/LegalMention';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy-load components that are not critical for FCP
const NewsletterPopup = dynamic(
	() => import('@/components/NewsletterPopup/NewsletterPopup'),
	{ ssr: true, loading: () => null }
);

const CookieConsent = dynamic(
	() => import('@/components/CookiesConsent/CookiesConsent'),
	{ ssr: true, loading: () => null }
);

export const metadata = {
	title: 'Cuisine artisanale',
	description: 'Recettes, actualités et cartes pour la cuisine artisanale.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="fr">
			<body>
				<Providers>
					<Navbar />
					<div className="wrapper">
						{children}
					</div>
					<LegalMention />
					<NewsletterPopup />
					<CookieConsent />
					<ToastContainer />
				</Providers>
			</body>
		</html>
	);
}


