import React, { useContext, useState } from 'react';
import './Navbar.css';

import { Link } from 'react-router-dom';
import AuthButton from '@components/AuthButton/AuthButton';

import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext/ThemeContext';

const Navbar: React.FC = () => {

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="Navbar">
        <section className='routing'>
          <nav>
            <ul className='menu'>
              <li>
                <Link to="/">Home</Link> {/* Lien vers la page d'accueil */}
              </li>
              <li className="menu-item">
                <Link to="/recipes" className="link">
                  Recipes
                </Link>
                <ul className="dropdown">
                  <li>
                    <Link to="/recipes" className="dropdown-item">
                      Voir les recettes
                    </Link>
                  </li>
                  <li>
                    <Link to="/map" className="dropdown-item">
                      Voir la carte
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link to="/about">About</Link> {/* Lien vers une page "À propos" */}
              </li>
            </ul>
          </nav>
        </section>
        <section className='boutons_user'>
          <section className='auth'>
            {user ? (
              <div className='auth_user'>
                <span>Welcome, {user.displayName || "User"}!</span>
                <Button label="Logout" onClick={logout} />
              </div>
            ) : (
              <AuthButton />
            )}
          </section>
          <Button className='button_darkMode' onClick={() => toggleTheme()}> {theme === "dark"  ? "🌞" : "🌙"} </Button>
        </section>
    </div>
  );
};

export default Navbar;
