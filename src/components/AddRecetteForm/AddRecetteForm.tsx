import React, { useEffect, useState } from 'react';
import './AddRecetteForm.css';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

import { db, storage } from '@firebaseModule';
import { collection, addDoc, updateDoc, doc, query, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
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

  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageURLs, setImageURLs] = useState<string[]>([]);

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
  

  function generateKeywords(title: string): string[] {
    return title.toLowerCase().split(" "); // Découpe en mots simples
  }
    

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
          images: [],
          steps: [],
          position: '',
          createdBy: '',
          titleKeywords: [],
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
          images: imageURLs,
          titleKeywords: generateKeywords(title),
        });

        setTitle('');
        setType(null);
        setIngredients([]);
        setPreparationTime(0);
        setCookingTime(0);
        setVideo('');
        setSteps([]);
        setPosition({});
        setImageURLs([]);
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
    } catch (error) {
      console.error("Error getting recettes: ", error);
    }
  }

  const handleFileChange = (e: { target: { files: any; }; }) => {
    setImages([...e.target.files]);
  };

  const handleUpload = async () => {
    if (images.length === 0) return;
    setUploading(true);
    const urls: string[] | ((prevState: never[]) => never[]) = [];

    for (let image of images) {
      const storageRef = ref(storage, `recipes/${title}/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            console.error("Upload failed:", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            urls.push(downloadURL);
            resolve();
          }
        );
      });
    }

    setImageURLs(urls);
    setUploading(false);
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
                  filter
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
                <input type="file" multiple onChange={handleFileChange} />
                <Button onClick={handleUpload} disabled={uploading || images.length === 0}>
                  {uploading ? "Uploading..." : "Upload Images"}
                </Button>

                {imageURLs.length > 0 && (
                  <div className="uploaded-images">
                    <h3>Images Uploadées</h3>
                    <section className="recette-images">
                      {imageURLs.map((url, index) => (
                        <img key={index} src={url} alt="uploaded" width="100px" />
                      ))}
                    </section>
                  </div>
                )}
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
