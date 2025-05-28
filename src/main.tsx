import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';
import { ThemeProvider } from '@contexts/ThemeContext/ThemeContext';

// Base styles
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'leaflet/dist/leaflet.css';

// Our custom theme (should be after PrimeReact base styles)
import './styles/theme.css';
import './index.css';

import App from './App';

// Création de la racine du composant
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider>
      <ThemeProvider> 
        <App />
      </ThemeProvider>
    </PrimeReactProvider>
  </StrictMode>
);
