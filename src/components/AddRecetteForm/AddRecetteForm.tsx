import React, { useState } from 'react';
import './AddRecetteForm.css';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';



const AddRecetteForm: React.FC = () => {

  let recetteId: string = '';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<number[]>([]);
  const [preparationTime, setPreparationTime] = useState(0);
  const [cookingTime, setCookingTime] = useState(0);
  const [video, setVideo] = useState('');
  const [isRecetteCreated, setIsRecetteCreated] = useState<boolean>(false);

  const types = [
    { id: 1, name: 'Entrée' },
    { id: 2, name: 'Plat' },
    { id: 3, name: 'Dessert' },
  ];

  const ingredientsList = [
    { id: 1, name: 'Pomme de terre' },
    { id: 2, name: 'Tomate' },
  ];

  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !description || !type || !ingredients || !preparationTime || !cookingTime) {
      alert('Please fill out all fields');
      return;
    }

    const selectedType = types.find(t => t.id === type)?.name;

    const selectedIngredients = ingredientsList.filter(ingredient => ingredients.includes(ingredient.id))
                                              .map(ingredient => ingredient.name);

    if (!isRecetteCreated) {
      try{
        const docRef = await addDoc(collection(db, 'recipes'), {
          title: '',
          description: '',
          type: '',
          ingredients: '',
          preparationTime: '',
          cookingTime: '',
          video: '',
          image: '',
        });

        recetteId = docRef.id;
        setIsRecetteCreated(true);
      }catch (error) {
        console.error('Error creating recette:', error);
      }

      try{
        const recetteRef = doc(db, 'recipes', recetteId);
        await updateDoc(recetteRef, {
          title,
          description,
          type: selectedType,
          ingredients: selectedIngredients,  
          preparationTime,
          cookingTime,
          video,
          id: recetteId,
          createdAt: new Date(),
        });

        setTitle('');
        setDescription('');
        setType(null);
        setIngredients([]);
        setPreparationTime(0);
        setCookingTime(0);
        setVideo('');
        setIsRecetteCreated(false);
      }catch (error) {
        console.error('Error updating recette:', error);
      }
    }
  };

  return (
    <div className="AddRecetteForm">
      <h1>Composer votre propre recettes</h1>
      <form onSubmit={handleSubmit} className='formRecette'>
        <div>
          <section className="formRecette_sectionText">
            <div>
              <label  htmlFor="title">Titre</label>
              <InputText type="text" id="title" value={title} onChange={(e)=> setTitle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <InputTextarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} ></InputTextarea>
            </div>
            <section className="formRecette_sectionDetails">
              <div>
                <label htmlFor="type">Type</label>
                <Dropdown id="type" optionLabel="name" value={type} options={types} onChange={(e:DropdownChangeEvent) => setType(e.value)} optionValue="id" />
              </div>
              <div>
                <label htmlFor="ingredients">Ingrédients</label>
                <MultiSelect id="ingredients" value={ingredients} onChange={(e: MultiSelectChangeEvent) => setIngredients(e.value)} optionLabel="name" options={ingredientsList}  optionValue="id" />
              </div>
            </section>
            <section className='cookingTime'>
              <div>
                <label htmlFor="preparationTime">Temps de préparation</label>
                <InputNumber id="preparationTime" value={preparationTime} onChange={(e)=> setPreparationTime(e.value??0)}/>
              </div>
              <div>
                <label htmlFor="cookingTime">Temps de cuisson</label>
                <InputNumber id="cookingTime" value={cookingTime} onChange={(e)=> setCookingTime(e.value ?? 0)}/>
              </div>
            </section>
          </section> 
          <section className="formRecette_sectionImage">
            <div>
              <label htmlFor='video'>Vidéo</label>
              <InputText id='video'value={video} onChange={(e)=> setTitle(e.target.value)} />
            </div>

          </section>
        </div>
        <Button type="submit">Ajouter</Button>
      </form>
    </div>
  );
};

export default AddRecetteForm;
