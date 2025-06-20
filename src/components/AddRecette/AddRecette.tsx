import React from 'react';
import './AddRecette.css';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext/AuthContext';

const AddRecette: React.FC = () => {
  const {user } = useAuth();

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/recettes/add-recipe");
  };

  return (
    <div className="AddRecette">
      <h2>Add recette</h2>
      <p>Share your recipes with the world!</p>
      <br />
      <br />
      {!user && <h1>You need to be logged in to add a recette</h1>}
      <Button onClick={handleClick} disabled={!user}>Add recette</Button>
    </div>
  );
};

export default AddRecette;
