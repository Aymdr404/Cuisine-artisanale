import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <div className="Navbar">
      <nav>
      <ul>
        <li>
          <Link to="/">Home</Link> {/* Lien vers la page d'accueil */}
        </li>
        <li>
          <Link to="/recipes">Recipes</Link> {/* Lien vers une autre page */}
        </li>
        <li>
          <Link to="/about">About</Link> {/* Lien vers une page "À propos" */}
        </li>
      </ul>
    </nav>
    </div>
  );
};

export default Navbar;
