import React from 'react';
import './Actualites.css';
import Actualite from '@/components/Actualite/Actualite';

const Actualites: React.FC = () => {
  return (
    <div className="Actualites">
      <Actualite />
      <Actualite />
      <Actualite />
    </div>
  );
};

export default Actualites;
