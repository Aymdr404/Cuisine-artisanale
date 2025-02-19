import React, { useContext, useEffect, useState } from 'react';
import './Navbar.css';

import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext/AuthContext';
import BurgerMenu from '@components/BurgerMenu/BurgerMenu';
import { Button } from 'primereact/button';
import { ThemeContext } from '@/contexts/ThemeContext/ThemeContext';
import ButtonLinkNav from '@components/ButtonLinkNav/ButtonLinkNav';

const Navbar: React.FC = () => {

  const { user } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const [recettePath, setRecettePath] = useState("/recettes");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRecettePath("/");
      } else {
        setRecettePath("/recettes");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="Navbar">
        <section className='routing'>
          <ButtonLinkNav />
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
