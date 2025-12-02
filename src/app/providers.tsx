'use client';

import { ReactNode, useEffect } from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { ThemeProvider } from '@/contexts/ThemeContext/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext/ToastContext';

type ProvidersProps = {
	children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
	// Lazy-load PrimeReact CSS after hydration to not block FCP
	useEffect(() => {
		// Only load CSS if not already loaded
		if (!document.querySelector('link[href*="primereact.min.css"]')) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = '/Cuisine-artisanale/primereact.min.css';
			document.head.appendChild(link);
		}

		if (!document.querySelector('link[href*="primeicons.css"]')) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = '/Cuisine-artisanale/primeicons.css';
			document.head.appendChild(link);
		}
	}, []);

	return (
		<PrimeReactProvider>
			<ThemeProvider>
				<AuthProvider>
					<ToastProvider>
						{children}
					</ToastProvider>
				</AuthProvider>
			</ThemeProvider>
		</PrimeReactProvider>
	);
}


