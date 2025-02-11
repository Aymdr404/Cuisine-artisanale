import React, { StrictMode } from 'react';
import ReactDOM, { createRoot } from 'react-dom/client';
import './index.css';

import App from './App';


import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";


// Création de la racine du composant
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider >
      <App />
    </PrimeReactProvider>
  </StrictMode>
);
