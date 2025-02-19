import React, { useState, useRef, useEffect } from 'react';
import './BurgerMenu.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import AuthButton from '../AuthButton/AuthButton';
import { Link } from 'react-router-dom';
import ButtonLinkNav from '../ButtonLinkNav/ButtonLinkNav';

const BurgerMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, role } = useAuth();

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
          <div className='menu-title'><ButtonLinkNav  /></div>
          <ul>
            {user && (
              <li>
                <Link to="/account" onClick={() => setOpen(false)} className="menu-item-link">account</Link>
              </li>
            )}
            {user && role === 'admin' && (
              <li>
                <Link to="/admin-panel" onClick={() => setOpen(false)} className="menu-item-link">admin</Link>
              </li>
            )}
            <li>
              <AuthButton onClick={() => setOpen(false)}  />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BurgerMenu;
