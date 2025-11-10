import type { ReactNode } from 'react';
import Providers from './providers';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'leaflet/dist/leaflet.css';
import '@/styles/theme.css';
import '@/styles/admin.css';
import '@/styles/dialog.css';
import '@/styles/toast.css';
import '@/index.css';
import '@/pages-legacy/Home/Home.css';
import Navbar from '@/components/Navbar/Navbar';
import LegalMention from '@/components/LegalMention/LegalMention';
import NewsletterPopup from '@/components/NewsletterPopup/NewsletterPopup';
import CookieConsent from '@/components/CookiesConsent/CookiesConsent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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


