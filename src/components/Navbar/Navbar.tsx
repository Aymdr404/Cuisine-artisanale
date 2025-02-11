import React, { useContext } from 'react';
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
        </section>
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
        <Button onClick={() => toggleTheme()}> {theme === "dark"  ? "🌞 Light Mode" : "🌙 Dark Mode"} </Button>
    </div>
  );
};

export default Navbar;
