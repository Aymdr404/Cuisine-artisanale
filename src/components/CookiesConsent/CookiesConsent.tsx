import React, { useState, useEffect } from 'react';
import './CookiesConsent.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@firebaseModule';
interface CookieChoice {
  functional: boolean;
  analytics: boolean;
  ads: boolean;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [choices, setChoices] = useState<CookieChoice>({
    functional: true, // obligatoires
    analytics: false,
    ads: false,
  });
  const [expanded, setExpanded] = useState(false); // pour l’animation du détail

  useEffect(() => {
    const stored = localStorage.getItem('cookieConsent');
    if (!stored) setShowBanner(true);
  }, []);

  const saveConsent = async (finalChoices: CookieChoice) => {
    localStorage.setItem('cookieConsent', JSON.stringify(finalChoices));
    setShowBanner(false);

	try {
		await addDoc(collection(db, 'cookieConsent'), {
			choices: finalChoices,
			timestamp: serverTimestamp(),
			userAgent: navigator.userAgent,
			language: navigator.language,
		});
	} catch (err) {
	console.error('Erreur Firebase:', err);
	}
  };

  const handleAcceptAll = () => {
    saveConsent({ functional: true, analytics: true, ads: true });
  };

  const handleDeclineAll = () => {
    saveConsent({ functional: true, analytics: false, ads: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setChoices(prev => ({ ...prev, [name]: checked }));
  };

  if (!showBanner) return null;

  return (
    <div className={`cookie-banner banner-show ${expanded ? 'expanded' : ''}`}>
      <p>
        Nous utilisons des cookies pour améliorer votre expérience et analyser la navigation.
      </p>

      <div className="cookie-buttons">
        <button onClick={handleAcceptAll} className="accept">Tout accepter</button>
        <button onClick={handleDeclineAll} className="decline">Tout refuser</button>
        <button onClick={() => setExpanded(!expanded)} className="manage">
          {expanded ? 'Fermer les options' : 'Gérer les cookies'}
        </button>
      </div>

      {expanded && (
        <div className="cookie-options">
          <label>
            <input type="checkbox" name="functional" checked disabled /> Fonctionnels (obligatoires)
          </label>
          <label>
            <input type="checkbox" name="analytics" checked={choices.analytics} onChange={handleChange} /> Analytiques
          </label>
          <label>
            <input type="checkbox" name="ads" checked={choices.ads} onChange={handleChange} /> Publicitaires
          </label>
          <button className="save" onClick={() => saveConsent(choices)}>Enregistrer mes choix</button>
        </div>
      )}
    </div>
  );
};

export default CookieConsent;
