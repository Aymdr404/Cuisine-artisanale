// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Navbar from '@components/Navbar/Navbar';
import Home from '@pages/Home/Home';
import Recipes from '@pages/Recettes/Recettes'; // Exemple de page "Recipes"
import About from '@pages/About/About'; // Exemple de page "About"
import { AuthProvider } from '@/contexts/AuthContext/AuthContext';
import AddRecetteForm from './components/AddRecetteForm/AddRecetteForm';
import RecetteDesc from './components/RecetteDesc/RecetteDesc';
import RecetteMap from '@pages/RecetteMap/RecetteMap';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar /> {/* Navbar visible sur toutes les pages */}
        <Routes>
          <Route path="/" element={<Home />} /> {/* Route pour la page d'accueil */}
          <Route path="/recettes" element={<Recipes />} /> {/* Route pour la page "Recipes" */}
          <Route path="/about" element={<About />} /> {/* Route pour la page "About" */}
          <Route path="/recettes/add-recipe" element={<AddRecetteForm />} />
          <Route path="/recettes/:id" element={<RecetteDesc />} />
          <Route path="/map" element={<RecetteMap/>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
