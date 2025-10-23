import React, { useState, useEffect } from 'react';
import './CookiesConsent.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@firebaseModule';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setShowBanner(true);
  }, []);

  const handleAccept = async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);

    // Sauvegarde dans Firebase
    try {
      await addDoc(collection(db, 'cookieConsent'), {
        accepted: true,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        language: navigator.language
      });
    } catch (err) {
      console.error('Erreur Firebase:', err);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <p>
        Nous utilisons des cookies pour améliorer votre expérience et analyser la navigation.
        Vous pouvez accepter ou refuser.
      </p>
      <div className="cookie-buttons">
        <button onClick={handleAccept} className="accept">Accepter</button>
        <button onClick={handleDecline} className="decline">Refuser</button>
      </div>
    </div>
  );
};

export default CookieConsent;
