// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Navbar from '@components/Navbar/Navbar';
import Home from '@pages/Home/Home';
import Recipes from '@pages/Recettes/Recettes'; // Exemple de page "Recipes"
import About from '@pages/About/About'; // Exemple de page "About"

const App = () => {
  return (
    <Router>
      <Navbar /> {/* Navbar visible sur toutes les pages */}
      <Routes>
        <Route path="/" element={<Home />} /> {/* Route pour la page d'accueil */}
        <Route path="/recipes" element={<Recipes />} /> {/* Route pour la page "Recipes" */}
        <Route path="/about" element={<About />} /> {/* Route pour la page "About" */}
      </Routes>
    </Router>
  );
};

export default App;
