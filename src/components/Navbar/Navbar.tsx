import React, { useContext } from 'react';
import './Navbar.css';

import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext/AuthContext';
import BurgerMenu from '@components/BurgerMenu/BurgerMenu';
import { Button } from 'primereact/button';
import { ThemeContext } from '@/contexts/ThemeContext/ThemeContext';

const Navbar: React.FC = () => {

  const { user } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="Navbar">
        <section className='routing'>
          <nav>
            <ul className='menu'>
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/recettes" className="link">
                  Recettes
                </NavLink>
                <ul className="dropdown">
                  <li>
                    <NavLink to="/recettes" className="dropdown-item">
                      Voir les recettes
                    </NavLink>
                  </li>
                  <li>
                    <Link to="/map" className="dropdown-item">
                      Voir la carte
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <NavLink to="/about">About</NavLink> {/* Lien vers une page "À propos" */}
              </li>
            </ul>
          </nav>
        </section>
        <section className='boutons_user'>
          {user && (
            <div >
              <span>Welcome, {user.displayName || "User"}!</span>
            </div>
          )}
          <BurgerMenu />
          <Button className='button_darkMode' onClick={() => toggleTheme()}> {theme === "dark"  ? "🌞" : "🌙"} </Button>
        </section>
    </div>
  );
};

export default Navbar;
