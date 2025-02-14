import React, { useEffect, useState } from 'react';
import './AddRecetteForm.css';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

import { db, storage } from '../../firebase';
import { collection, addDoc, updateDoc, doc, query, getDocs } from 'firebase/firestore';
import { getDownloadURL, uploadBytes, ref } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext/AuthContext';



interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
}

const AddRecetteForm: React.FC = () => {
  const { user } = useAuth();

  let recetteId: string = '';
  const [title, setTitle] = useState('');
  const [type, setType] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<number[]>([]);
  const [preparationTime, setPreparationTime] = useState<number | null>(null);
  const [cookingTime, setCookingTime] = useState<number | null>(null);
  const [video, setVideo] = useState('');
  const [isRecetteCreated, setIsRecetteCreated] = useState<boolean>(false);
  const [steps, setSteps] = useState<string[]>([]);

  const [regions, setRegions] = useState([]);
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [ingredientQuantities, setIngredientQuantities] = useState<{ [key: string]: string }>({});

  const [position, setPosition] = useState({});

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const types = [
    { id: 1, name: 'Entrée' },
    { id: 2, name: 'Plat' },
    { id: 3, name: 'Dessert' },
  ];


  const addStep = () => {
    setSteps([...steps, '']);
  };

    const removeStep = (index: number) => {
      setSteps(steps.filter((_, i) => i !== index));
    };
  
    const handleStepChange = (index: number, value: string) => {
      const newSteps = [...steps];
      newSteps[index] = value;
      setSteps(newSteps);
    };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPreparationTime(preparationTime ?? 0);
    setCookingTime(cookingTime ?? 0);

    if (!title || !type || !ingredients || preparationTime === null || cookingTime === null || !steps || !position) {
      alert('Please fill out all fields');
      return;
    }

    const selectedType = types.find(t => t.id === type)?.name;

    const selectedIngredients = ingredients.map(id => {
      const ingredient = ingredientsList.find(i => i.id === id.toString());
      return ingredient ? { 
        id: ingredient.id, 
        name: ingredient.name, 
        quantity: ingredientQuantities[id] || 'N/A'
      } : null;
    }).filter(Boolean);
    
    
    if (!isRecetteCreated) {
      try{
        const docRef = await addDoc(collection(db, 'recipesRequest'), {
          title: '',
          type: '',
          ingredients: '',
          preparationTime: '',
          cookingTime: '',
          video: '',
          image: '',
          steps: [],
          position: '',
          createdBy: '',
        });

        recetteId = docRef.id;
        setIsRecetteCreated(true);
      }catch (error) {
        console.error('Error creating recette:', error);
      }

      try{
        const recetteRef = doc(db, 'recipesRequest', recetteId);
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
          createdBy: user?.uid,
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
        navigateBack();
      }catch (error) {
        console.error('Error updating recette:', error);
      }
    }
  };
  
  useEffect(() => {
    fetch("https://geo.api.gouv.fr/departements").then(res => res.json()).then(data => setRegions(data));
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const recettesCollection = collection(db, "ingredients");
      let recettesQuery = query(recettesCollection);

      const querySnapshot = await getDocs(recettesQuery);
      const recettesData: Ingredient[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          id: doc.id,
        };
      });
      
      setIngredientsList(recettesData);
      console.log("Recettes: ", recettesData);
    } catch (error) {
      console.error("Error getting recettes: ", error);
    }
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const storageRef = ref(storage, `images/${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      console.log("Image téléchargée avec succès");
      const url = await getDownloadURL(snapshot.ref);
      setImageUrl(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement", error);
    }
  };

  const navigateBack = () => {
    window.history.back();
  };

  return (
    <div className="AddRecetteForm">
      <h1>Composer votre propre recettes</h1>
      <p>Remplissez les champs avec un * pour créer une recette</p>
      <form onSubmit={handleSubmit} className='formRecette'>
        <div>
          <section className="formRecette_sectionText">
            <div>
              <label  htmlFor="title">*Titre:</label>
              <InputText type="text" id="title" value={title} onChange={(e)=> setTitle(e.target.value)} />
            </div>
            <div className="steps-section">
              <h3>*Étapes de préparation:</h3>
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
              <Button type="button" onClick={addStep} className="add-step-btn">+ Ajouter une étape</Button>
            </div>
            <section className="formRecette_sectionDetails">
              <div>
                <label htmlFor="type">*Type:</label>
                <Dropdown id="type" optionLabel="name" value={type} options={types} onChange={(e:DropdownChangeEvent) => setType(e.value)} optionValue="id" />
              </div>
              <div>
                <label htmlFor="ingredients">*Ingrédients:</label>
                <MultiSelect 
                  id="ingredients" 
                  value={ingredients} 
                  onChange={(e: MultiSelectChangeEvent) => setIngredients(e.value)} 
                  optionLabel="name" 
                  options={ingredientsList}  
                  optionValue="id" 
                />
              </div>
            </section>
            <section className='ingredients_part'>
              {ingredients.map((id) => (
                <div key={id}>
                  <label>{ingredientsList.find(i => i.id === id.toString())?.name} - Quantité:</label>
                  <input 
                    type="text" 
                    value={ingredientQuantities[id] || ''} 
                    onChange={(e) => setIngredientQuantities(prev => ({ ...prev, [id]: e.target.value }))} 
                    placeholder="Ex: 200g, 2 pièces..."
                  />
                </div>
              ))}
            </section>
            <section className='cooking_recette'>
              <div>
                <label htmlFor="preparationTime">*Temps de préparation:</label>
                <InputNumber id="preparationTime" value={preparationTime} onChange={(e)=> setPreparationTime(e.value??0)}/>
              </div>
              <div>
                <label htmlFor="cookingTime">*Temps de cuisson:</label>
                <InputNumber id="cookingTime" value={cookingTime} onChange={(e)=> setCookingTime(e.value ?? 0)}/>
              </div>
            </section>
          </section> 
          <section className="formRecette_sectionMedia">
            <div className='formRecette_media'>
              <div>
                <label htmlFor='video'>Vidéo:</label>
                <InputText type='text' id='video'value={video} onChange={(e)=> setTitle(e.target.value)} />
              </div>

              <div className='formRecette_image'>
                <input type="file" onChange={handleFileChange} />
                <Button type="button" onClick={handleUpload}>Uploader</Button>
              </div>
            </div>

            <div className='formRecette_region'>
              <label htmlFor='position'>*Département:</label>
              <Dropdown id='position' optionLabel='nom' value={position} options={regions} onChange={(e:DropdownChangeEvent) => setPosition(e.value)} optionValue='code' />
            </div>

          </section>
        </div>
        <section className='formRecette_sectionButtons'>
          <Button type="submit">Ajouter</Button>
          <Button type="reset" onClick={navigateBack}>Annuler</Button>
        </section>
      </form>
    </div>
  );
};

export default AddRecetteForm;
