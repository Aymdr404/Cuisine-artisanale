import React, { useState, useRef, useEffect, useContext } from 'react';
import './BurgerMenu.css';
import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import AuthButton from '../AuthButton/AuthButton';
import { ThemeContext } from '@/contexts/ThemeContext/ThemeContext';

const BurgerMenu: React.FC = () => {
  const [open, setOpen] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="menu-container" ref={menuRef}>
      <div className={`burger ${open ? "open" : ""}`}  onClick={() => setOpen(!open)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      {open && (
        <div className={`dropdown ${open ? "show" : ""}`}>
          <ul>
            {user && (
              <li>
                <span>Acount</span>
              </li>
            )}
              {user ? (
                <li>
                  <Button label="Logout" onClick={logout} />  
                </li>
              ) : (
                <li>
                  <AuthButton />
                </li>
              )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;
