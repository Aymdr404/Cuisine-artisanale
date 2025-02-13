import React, { StrictMode } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import './index.css';

import App from './App';


import { PrimeReactProvider } from 'primereact/api';
import { ThemeProvider } from '@contexts/ThemeContext/ThemeContext';

import 'leaflet/dist/leaflet.css'
import 'primeicons/primeicons.css';

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
