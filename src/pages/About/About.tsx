import React from 'react';
import './About.css';
import LienUtiles from '@components/LienUtiles/LienUtiles';

const About: React.FC = () => {
  return (
    <div className="About">
      <h2>Bienvenue sur <strong>Cuisine artisanale</strong> ! </h2>
      <h3>Qui sommes-nous ?</h3>
      <p>Je suis un jeune développeur passionée de gastronomie. Qui est convaincu que cuisiner doit être un plaisir quotidien.</p>

      <h3>Notre mission</h3>
      <p>Notre mission est de vous aider à cuisiner des plats savoureux, équilibrés et adaptés à vos envies.
        Nous vous proposons des recettes variées, faciles à réaliser et adaptées à tous les goûts.
        Que vous soyez amateur ou passionné de cuisine, vous trouverez de quoi ravir vos papilles !</p>

      <h3>Pourquoi ce site</h3>
      <p>
        Je suis convaincu que cuisiner doit être un plaisir quotidien. C’est pourquoi j’ai créé ce site pour vous aider à cuisiner des plats savoureux, équilibrés et adaptées à vos envies.
        De plus ce projet me permet de pratiquer mes compétences en développement web et en gestion de base dedonnées.
      </p>

      <h3>Liens utiles</h3>
      <p>Envie d'échanger avec moi ou de me proposer des idées pour ce site (ou autres) </p>

      <LienUtiles />
    </div>
  );
};

export default About;
