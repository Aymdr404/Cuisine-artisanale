import React, { StrictMode } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import './index.css';

import App from './App';


import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "./global.css";
import { ThemeProvider } from '@contexts/ThemeContext/ThemeContext';


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
