import React, { useEffect, useState } from 'react';
import './AddRecetteForm.css';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';



const AddRecetteForm: React.FC = () => {

  let recetteId: string = '';
  const [title, setTitle] = useState('');
  const [type, setType] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<number[]>([]);
  const [preparationTime, setPreparationTime] = useState(0);
  const [cookingTime, setCookingTime] = useState(0);
  const [video, setVideo] = useState('');
  const [isRecetteCreated, setIsRecetteCreated] = useState<boolean>(false);
  const [steps, setSteps] = useState<string[]>([]);

  const [regions, setRegions] = useState([]);
  const [position, setPosition] = useState({});

  const types = [
    { id: 1, name: 'Entrée' },
    { id: 2, name: 'Plat' },
    { id: 3, name: 'Dessert' },
  ];

  const ingredientsList = [
    { id: 1, name: 'Pomme de terre' },
    { id: 2, name: 'Tomate' },
  ];

  const addStep = () => {
    setSteps([...steps, '']);
  };

    // Supprimer une étape
    const removeStep = (index: number) => {
      setSteps(steps.filter((_, i) => i !== index)); // Supprime l'étape ciblée
    };
  
    // Modifier une étape existante
    const handleStepChange = (index: number, value: string) => {
      const newSteps = [...steps];
      newSteps[index] = value;
      setSteps(newSteps);
    };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !type || !ingredients || !preparationTime || !cookingTime || !steps) {
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
          type: '',
          ingredients: '',
          preparationTime: '',
          cookingTime: '',
          video: '',
          image: '',
          steps: [],
          position: '',
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
          type: selectedType,
          ingredients: selectedIngredients,  
          preparationTime,
          cookingTime,
          video,
          id: recetteId,
          createdAt: new Date(),
          steps,
          position,
        });

        setTitle('');
        setType(null);
        setIngredients([]);
        setPreparationTime(0);
        setCookingTime(0);
        setVideo('');
        setSteps([]);
        setPosition({});
        setIsRecetteCreated(false);
      }catch (error) {
        console.error('Error updating recette:', error);
      }
    }
  };


  useEffect(() => {
    fetch("https://geo.api.gouv.fr/regions").then(res => res.json()).then(data => setRegions(data));
  }, []);


  return (
    <div className="AddRecetteForm">
      <h1>Composer votre propre recettes</h1>
      <form onSubmit={handleSubmit} className='formRecette'>
        <div>
          <section className="formRecette_sectionText">
            <div>
              <label  htmlFor="title">Titre:</label>
              <InputText type="text" id="title" value={title} onChange={(e)=> setTitle(e.target.value)} />
            </div>
            <div className="steps-section">
              <h3>Étapes de préparation:</h3>
              {steps.map((step, index) => (
                <div key={index} className="step-container">
                  <InputText
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Étape ${index + 1}`}
                    required
                  />
                  <Button type="button" onClick={() => removeStep(index)} className="delete-step-btn">
                    ❌
                  </Button>
                </div>
              ))}
              <button type="button" onClick={addStep} className="add-step-btn">+ Ajouter une étape</button>
            </div>
            <section className="formRecette_sectionDetails">
              <div>
                <label htmlFor="type">Type:</label>
                <Dropdown id="type" optionLabel="name" value={type} options={types} onChange={(e:DropdownChangeEvent) => setType(e.value)} optionValue="id" />
              </div>
              <div>
                <label htmlFor="ingredients">Ingrédients:</label>
                <MultiSelect id="ingredients" value={ingredients} onChange={(e: MultiSelectChangeEvent) => setIngredients(e.value)} optionLabel="name" options={ingredientsList}  optionValue="id" />
              </div>
            </section>
            <section className='cooking_recette'>
              <div>
                <label htmlFor="preparationTime">Temps de préparation:</label>
                <InputNumber id="preparationTime" value={preparationTime} onChange={(e)=> setPreparationTime(e.value??0)}/>
              </div>
              <div>
                <label htmlFor="cookingTime">Temps de cuisson:</label>
                <InputNumber id="cookingTime" value={cookingTime} onChange={(e)=> setCookingTime(e.value ?? 0)}/>
              </div>
            </section>
          </section> 
          <section className="formRecette_sectionImage">
            <div>
              {/* <Button onClick={getLocation}>Utiliser ma position</Button> */}

              <label htmlFor='video'>Vidéo:</label>
              <InputText id='video'value={video} onChange={(e)=> setTitle(e.target.value)} />
            </div>

            <div className='formRecette_region'>
              <label htmlFor='position'>Position:</label>
              <Dropdown id='position' optionLabel='nom' value={position} options={regions} onChange={(e:DropdownChangeEvent) => setPosition(e.value)} optionValue='code' />
            </div>

          </section>
        </div>
        <section className='formRecette_sectionButtons'>
          <Button type="submit">Ajouter</Button>
          <Button type="reset">Annuler</Button>
        </section>
      </form>
    </div>
  );
};

export default AddRecetteForm;
