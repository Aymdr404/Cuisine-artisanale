import React, { useState } from 'react';
import './AddUnitForm.css';

import { addDoc, collection, doc, updateDoc } from '@firebase/firestore';
import { db } from '@firebaseModule';

const AddUnitForm: React.FC<{ closeForm: () => void }> = ({ closeForm }) => {

  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');


  const handleSudmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name || !abbreviation) {
      alert('Please fill out the title field');
      return;
    }

    const newUnit = {
      name,
      abbreviation,
    };

    let unitId: string = '';
    
    try{
      const docRef = await addDoc(collection(db, 'units'), {
        name: '',
        abbreviation: '',
      });
      unitId = docRef.id;
    }catch (error) {
      console.error('Error creating unit:', error);
    }

    try {
      const unitRef = doc(db, 'units', unitId);
      await updateDoc(unitRef, {
        unitId,
        name: newUnit.name,
        abbreviation: newUnit.abbreviation,
        createdAt: new Date(),
      });
      setName('');
      setAbbreviation('');
      closeForm();
    }catch (error) {
      console.error('Error updating unit:', error);
    }
  }

  return (
    <div className="AddUnitForm">
      <form onSubmit={handleSudmit} className='formUnits'>
        <h3>Add units</h3>

        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter a unit name"
          />
        </div>
        <div>
          <label htmlFor="abbreviation">Abbreviation</label>
          <input
            type="text"
            id="abbreviation"
            value={abbreviation}
            onChange={(event) => setAbbreviation(event.target.value)}
            placeholder="Enter an abbreviation"
          />
        </div>
        <div className='button-container'>
          <button type='submit'>Add</button>
          <button onClick={closeForm}>Close</button>
        </div>
      </form>
    </div>
  );
};

export default AddUnitForm;
