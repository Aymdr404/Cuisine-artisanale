import React, { useEffect, useState } from 'react';
import './ButtonLinkNav.css';
import { NavLink } from 'react-router-dom';

const ButtonLinkNav: React.FC = () => {

  const [recettePath, setRecettePath] = useState("/recettes");
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRecettePath("");
      } else {
        setRecettePath("/recettes");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <div className="ButtonLinkNav">
      <nav>
        <ul className='menu'>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li className="menu-item">
            <NavLink to={recettePath} className="link">
              Recettes
            </NavLink>
            <ul className="dropdown-container">
              <li>
                <NavLink to="/recettes" className="dropdown-item">
                  Voir les recettes
                </NavLink>
              </li>
              <li>
                <NavLink to="/map" className="dropdown-item">
                  Voir la carte
                </NavLink>
              </li>
            </ul>
          </li>
          <li>
            <NavLink to="/about">About</NavLink> {/* Lien vers une page "À propos" */}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ButtonLinkNav;
