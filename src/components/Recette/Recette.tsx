import React from 'react';
import './Recette.css';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';


interface RecetteProps {
  recetteId: number;
  title: string;
  description: string;
  type: string;
}

const Recette: React.FC<RecetteProps> = ({recetteId, title, description, type}) => {
  return (
    <div className="Recette">
      <h1>{title}</h1>
      <p>{description}</p>
      <p>{type}</p>

      <Link to={`/recette/${recetteId}`}>
            <button>Voir la recette</button>
        </Link>
    </div>
  );
};

export default Recette;
