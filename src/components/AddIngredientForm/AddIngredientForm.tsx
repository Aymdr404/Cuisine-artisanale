import React, { useState } from 'react';
import './AddIngredientForm.css';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';

import { addDoc, collection, doc, updateDoc } from '@firebase/firestore';
import { db } from '@firebaseModule';

const AddIngredientForm: React.FC<{ closeForm: () => void }> = ({ closeForm }) => {

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name || !unit || !category) {
      alert('Please fill out the title field');
      return;
    }

    const newIngredient = {
      name,
      price,
      unit,
      category,
    };

    let ingredientId: string = '';

    try{
      const docRef = await addDoc(collection(db, 'ingredients'), {
        name: '',
        price: 0,
        unit: '',
        category: '',
      });
      ingredientId = docRef.id;
    }catch (error) {
      console.error('Error creating ingredient:', error);
    }

    try {
      const ingredientRef = doc(db, 'ingredients', ingredientId);
      await updateDoc(ingredientRef, {
        ingredientId,
        name: newIngredient.name,
        price: newIngredient.price,
        unit: newIngredient.unit,
        category: newIngredient.category,
        createdAt: new Date(),
      });
      setName('');
      setPrice(0);
      setUnit('');
      setCategory('');
      closeForm();

    }catch (error) {
      console.error('Error updating ingredient:', error);
    }

  };

  return (
    <div className="AddIngredientForm">
      <form onSubmit={handleSubmit} className='formIngredients'>
        <h3>Add an ingredient</h3>
        <p>* Required fields</p>
        <br />

        <div>
          <label htmlFor="name">*Name:</label>
          <InputText type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter an ingredient name"/>
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <InputNumber id="price" value={price} onValueChange={(e) => setPrice(e.value!)} mode="currency" currency="USD" placeholder="Enter ingredient price"/>
        </div>
        <div>
          <label htmlFor="unit">*Unit:</label>
          <InputText type="text" id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Enter ingredient unit"/>
        </div>
        <div>
          <label htmlFor="category">*Category:</label>
          <InputText type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Enter ingredient category"/>
        </div>
        <section className='buttons-form'>
          <Button type="submit" label='Submit'/>
          <br />
          <br />
          <Button label='close' onClick={closeForm} />
        </section>
      </form>
    </div>
  );
};

export default AddIngredientForm;
