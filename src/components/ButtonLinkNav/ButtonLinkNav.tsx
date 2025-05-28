import React from 'react';
import './ButtonLinkNav.css';
import { NavLink, useLocation } from 'react-router-dom';

interface ButtonLinkNavProps {
  onClick?: () => void;
  isMobile?: boolean;
}

const ButtonLinkNav: React.FC<ButtonLinkNavProps> = ({ onClick, isMobile = false }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Accueil' },
    { path: '/recettes', label: 'Recettes' },
    { path: '/map', label: 'Map' },
    { path: '/about', label: 'À propos' }
  ];

  return (
    <div className={`ButtonLinkNav ${isMobile ? 'mobile' : ''}`}>
      <nav>
        <ul className="menu">
          {navItems.map((item) => (
            <li key={item.path} className="menu-item">
              <NavLink
                to={item.path}
                onClick={onClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default ButtonLinkNav;
