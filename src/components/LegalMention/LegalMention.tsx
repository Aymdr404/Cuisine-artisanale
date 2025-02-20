import React, { useEffect } from 'react';
import './LegalMention.css';
import LienUtiles from '@components/LienUtiles/LienUtiles';
import { useLocation } from 'react-router-dom';

const LegalMention: React.FC = () => {

  const [ISAboutPAge, setIsAboutPage] = React.useState(false);
  const location = useLocation();

  useEffect(() => {
    if(location.pathname === '/about') {
      setIsAboutPage(true);
    } else {
      setIsAboutPage(false);
    }
  }
  , [location]);


  return (
    <div className="LegalMention">
      <header className="legalMention-header">
          <p>Mentions légales / ©Aymeric sabatier</p>
          {!ISAboutPAge && 
          (
            <LienUtiles />
          )}


        </header>
    </div>
  );
};

export default LegalMention;
