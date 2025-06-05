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
import { toast } from 'react-toastify';

interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
}

interface Department {
  nom: string;
  code: string;
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

  const [regions, setRegions] = useState<Department[]>([]);
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [ingredientQuantities, setIngredientQuantities] = useState<{ [key: string]: string }>({});

  const defaultDepartment: Department = { nom: "Aucun département", code: "none" };
  const [position, setPosition] = useState<Department>(defaultDepartment);

  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageURLs, setImageURLs] = useState<string[]>([]);

  const types = [
    { id: 1, name: 'Entrée' },
    { id: 2, name: 'Plat' },
    { id: 3, name: 'Dessert' },
    { id: 4, name: 'Boisson' },
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

  const slugify = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .toLowerCase();
  };

  function generateUrl(title: string): string {
    return slugify(title);
  } 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPreparationTime(preparationTime ?? 0);
    setCookingTime(cookingTime ?? 0);

    if (!title || !type || !ingredients || preparationTime === null || cookingTime === null || !steps || !steps.every(step => step.trim() !== '')) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

    const selectedType = types.find(t => t.id === type)?.name;

    const selectedIngredients = ingredients.map(id => {
      const ingredient = ingredientsList.find(i => i.id === id.toString());
      return ingredient ? { 
        id: ingredient.id, 
        name: ingredient.name, 
        quantity: ingredientQuantities[id] || 'N/A',
        unit: ingredient.unit || ''
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
          url: '',
        });

        recetteId = docRef.id;
        setIsRecetteCreated(true);
      }catch (error) {
        console.error('Error creating recette:', error);
      }

      try{
        const recetteRef = doc(db, 'recipesRequest', recetteId);
        await updateDoc(recetteRef, {
          title: capitalizedTitle,
          type: selectedType,
          ingredients: selectedIngredients,  
          preparationTime,
          cookingTime,
          video,
          id: recetteId,
          createdAt: new Date(),
          steps,
          position: position?.code || 'none',
          createdBy: user?.uid,
          images: imageURLs,
          titleKeywords: generateKeywords(capitalizedTitle),
          url: generateUrl(capitalizedTitle),
        });

        

        setTitle('');
        setType(null);
        setIngredients([]);
        setPreparationTime(0);
        setCookingTime(0);
        setVideo('');
        setSteps([]);
        setPosition(defaultDepartment);
        setImageURLs([]);
        setIsRecetteCreated(false);
        navigateBack();
        toast.success('Recette envoyée à la vérification admin');
      }catch (error) {
        console.error('Error updating recette:', error);
      }
    }
  };
  
  useEffect(() => {
    fetch("https://geo.api.gouv.fr/departements")
      .then(res => res.json())
      .then(data => {
        const departmentsWithDefault = [
          defaultDepartment,
          ...data.map((dept: any) => ({
            nom: dept.nom,
            code: dept.code
          }))
        ];
        setRegions(departmentsWithDefault);
      });
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
          unit: data.unit || '',
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
    <div className="add-recipe-container">
      <header className="add-recipe-header">
        <h1>Composer votre propre recette</h1>
        <p className="subtitle">Les champs marqués d'un * sont obligatoires</p>
      </header>

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-grid">
          {/* Basic Information Section */}
          <section className="form-section basic-info">
            <h2>Informations de base</h2>
            <div className="form-group">
              <label htmlFor="title">Titre *</label>
              <InputText 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entrez le titre de votre recette"
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type de plat *</label>
              <Dropdown 
                id="type" 
                value={type} 
                options={types} 
                onChange={(e: DropdownChangeEvent) => setType(e.value)} 
                optionLabel="name" 
                optionValue="id"
                placeholder="Sélectionnez un type"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Département d'origine</label>
              <Dropdown 
                id="position" 
                value={position} 
                options={regions} 
                onChange={(e: DropdownChangeEvent) => setPosition(e.value)}
                optionLabel="nom" 
                optionValue="code"
                placeholder="Sélectionnez un département"
              />
            </div>
          </section>

          {/* Ingredients Section */}
          <section className="form-section ingredients">
            <h2>Ingrédients *</h2>
            <div className="form-group">
              <label htmlFor="ingredients">Sélection des ingrédients</label>
              <MultiSelect 
                id="ingredients" 
                value={ingredients} 
                onChange={(e: MultiSelectChangeEvent) => setIngredients(e.value)} 
                options={ingredientsList} 
                optionLabel="name" 
                optionValue="id"
                filter
                placeholder="Sélectionnez les ingrédients"
                required
                className="ingredients-select"
                panelClassName="ingredients-panel"
                display="chip"
                showClear
                itemTemplate={(option) => option.name}
              />
            </div>

            <div className="ingredients-list">
              {ingredients.map((id) => {
                const ingredient = ingredientsList.find(i => i.id === id.toString());
                return (
                  <div key={id} className="ingredient-item">
                    <div className="ingredient-info">
                      <span className="ingredient-name">{ingredient?.name}</span>
                      <div className="ingredient-quantity">
                        <InputNumber 
                          value={ingredientQuantities[id] ? parseFloat(ingredientQuantities[id]) : null} 
                          onChange={(e) => {
                            const value = e.value;
                            setIngredientQuantities(prev => ({ 
                              ...prev, 
                              [id]: value !== null ? value.toString() : '' 
                            }));
                          }}
                          placeholder="Quantité"
                          min={0}
                          mode="decimal"
                          minFractionDigits={0}
                          maxFractionDigits={2}
                          className="ingredient-quantity-input"
                          locale="fr-FR"
                        />
                        <span className="ingredient-unit">{ingredient?.unit}</span>
                      </div>
                    </div>
                    <Button 
                      icon="pi pi-times" 
                      className="p-button-rounded p-button-danger p-button-text remove-ingredient"
                      onClick={() => {
                        setIngredients(ingredients.filter(i => i !== id));
                        const newQuantities = { ...ingredientQuantities };
                        delete newQuantities[id];
                        setIngredientQuantities(newQuantities);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Timing Section */}
          <section className="form-section timing">
            <h2>Temps de préparation</h2>
            <div className="time-inputs">
              <div className="form-group">
                <label htmlFor="preparationTime">Préparation (min) *</label>
                <InputNumber 
                  id="preparationTime" 
                  value={preparationTime} 
                  onChange={(e) => setPreparationTime(e.value)}
                  min={0}
                  required
                  mode="decimal"
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  locale="fr-FR"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cookingTime">Cuisson (min) *</label>
                <InputNumber 
                  id="cookingTime" 
                  value={cookingTime} 
                  onChange={(e) => setCookingTime(e.value)}
                  min={0}
                  required
                  mode="decimal"
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  locale="fr-FR"
                />
              </div>
            </div>
          </section>

          {/* Steps Section */}
          <section className="form-section steps">
            <h2>Étapes de préparation *</h2>
            <div className="steps-container">
              {steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-number">{index + 1}</div>
                  <InputText
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder="Décrivez cette étape..."
                    required
                  />
                  <Button 
                    type="button" 
                    icon="pi pi-times" 
                    onClick={() => removeStep(index)}
                    className="delete-step"
                  />
                </div>
              ))}
              <Button 
                type="button" 
                onClick={addStep} 
                className="add-step"
                icon="pi pi-plus"
                label="Ajouter une étape"
              />
            </div>
          </section>

          {/* Media Section */}
          <section className="form-section media">
            <h2>Médias</h2>
            <div className="form-group">
              <label htmlFor="video">Lien vidéo</label>
              <InputText 
                id="video" 
                value={video} 
                onChange={(e) => setVideo(e.target.value)}
                placeholder="URL de votre vidéo YouTube"
              />
            </div>

            <div className="form-section">
              <h2>Images</h2>
              <div className="upload-container">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="file-input"
                  accept="image/*"
                />
                <Button
                  label="Télécharger les images"
                  icon="pi pi-upload"
                  onClick={handleUpload}
                  disabled={images.length === 0 || uploading}
                  className="upload-button"
                />
              </div>
              {imageURLs.length > 0 && (
                <div className="image-grid">
                  {imageURLs.map((url, index) => (
                    <div key={index} className="image-preview">
                      <img src={url} alt={`Preview ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="form-actions">
          <Button type="submit" label="Créer la recette" icon="pi pi-check" className="submit-button" />
          <Button type="button" label="Annuler" icon="pi pi-times" className="cancel-button" onClick={navigateBack} />
        </footer>
      </form>
    </div>
  );
};

export default AddRecetteForm;
