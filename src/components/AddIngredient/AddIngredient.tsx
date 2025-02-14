import React, { useState } from 'react';
import './AddIngredient.css';
import { Button } from 'primereact/button';
import AddIngredientForm from '../AddIngredientForm/AddIngredientForm';

const AddIngredient: React.FC = () => {

  const [showForm, setShowForm] = useState(false);

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };


  return (
    <div className="AddIngredient">
      <Button label="Add Ingredient" icon="pi pi-plus" onClick={openForm} className="p-button-raised p-button-rounded" />

      {showForm && <AddIngredientForm closeForm={closeForm} />}
    </div>
  );
};

export default AddIngredient;
