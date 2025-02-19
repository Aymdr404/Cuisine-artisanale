import React, { useContext } from 'react';
import './Navbar.css';


import { useAuth } from '@/contexts/AuthContext/AuthContext';
import BurgerMenu from '@components/BurgerMenu/BurgerMenu';
import { Button } from 'primereact/button';
import { ThemeContext } from '@/contexts/ThemeContext/ThemeContext';
import ButtonLinkNav from '@components/ButtonLinkNav/ButtonLinkNav';

const Navbar: React.FC = () => {

  const { user } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

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
