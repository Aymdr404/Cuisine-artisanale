import React, { useEffect } from 'react';
import './LegalMention.css';
import LienUtiles from '@components/LienUtiles/LienUtiles';
import { useLocation, Link } from 'react-router-dom';

const LegalMention: React.FC = () => {
  const [isAboutPage, setIsAboutPage] = React.useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsAboutPage(location.pathname === '/about');
  }, [location]);

  return (
    <div className="LegalMention">
      <header className="legalMention-header">
        <Link to="/legal-mentions">Mentions légales / ©Aymeric Sabatier</Link>
        <Link to="/privacy-policy">Politique de confidentialité / ©Aymeric Sabatier</Link>
        {!isAboutPage && <LienUtiles />}
      </header>
    </div>
  );
};

export default LegalMention;
