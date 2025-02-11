import React from 'react';
import './AddRecette.css';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const AddRecette: React.FC = () => {

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/recipes/add-recipe");
  };

  return (
    <div className="AddRecette">
      <h2>Add recette</h2>
      <p>Share your recipes with the world!</p>
      <br />
      <br />
      <br />
      <Button onClick={handleClick}>Add recette</Button>
    </div>
  );
};

export default AddRecette;
