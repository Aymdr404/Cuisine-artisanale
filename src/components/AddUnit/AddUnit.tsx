import React, { useState } from 'react';
import './AddUnit.css';
import { Button } from 'primereact/button';
import AddUnitForm from '../AddUnitForm/AddUnitForm';

const AddUnit: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };
  

  return (
    <div className="AddUnit">
      <Button label="Add units" icon="pi pi-plus" onClick={openForm} className="p-button-raised p-button-rounded" />

      {showForm && <AddUnitForm closeForm={closeForm} />}
    </div>
  );
};

export default AddUnit;
