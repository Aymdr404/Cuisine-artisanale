import React, { useEffect, useState } from 'react';
import './EditRecette.css';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { db, storage } from '@firebaseModule';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';


interface Recette{
  id: string;
  title: string;
  type: string;
  cookingTime: number;
  preparationTime: number;
  ingredients: Ingredient[];
  video: string;
  steps: string[];
  position: string;
  images?: string[];
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

const EditRecette: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recette, setRecette] = useState<Recette | null>(null);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [preparationTime, setPreparationTime] = useState<number>(0);
  const [cookingTime, setCookingTime] = useState<number>(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [video, setVideo] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageURLs, setImageURLs] = useState<string[]>([]);

  // Fetch the recette data from Firestore
  const getRecette = async (id: string) => {
    const recetteRef = doc(db, 'recipes', id);
  
    try {
      const recetteSnap = await getDoc(recetteRef);
      
      if (!recetteSnap.exists()) {
        console.log("Pas de recette trouvée avec cet ID");
        return;
      }

      const recetteData = recetteSnap.data() as Recette;

      setRecette(recetteData);
      setTitle(recetteData.title);
      setType(recetteData.type);
      setPreparationTime(recetteData.preparationTime);
      setCookingTime(recetteData.cookingTime);
      setSteps(recetteData.steps);
      setVideo(recetteData.video || '');
      setImageURLs(recetteData.images || []);

    } catch (error) {
      console.error("Erreur lors de la récupération de la recette :", error);
    }
  };

  useEffect(() => {
    if (id) {
      getRecette(id);
    }
  }, [id]);

  // Handle form submission to update the recipe
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    const updatedRecette = {
      title,
      type,
      preparationTime,
      cookingTime,
      steps,
      video,
      images: imageURLs,
    };

    const recetteRef = doc(db, 'recipes', id);

    try {
      await updateDoc(recetteRef, updatedRecette);
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/recettes');
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la recette :", error);
    }
  };

  const addStep = () => setSteps([...steps, '']);
  const handleStepChange = (index: number, value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));


  const handleFileChange = (e: { target: { files: any; }; }) => {
    // Ajouter les nouvelles images aux images existantes
    const newImages: File[] = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...newImages]);
  };
  
  const handleUpload = async () => {
    if (images.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
  
    // Télécharger les nouvelles images
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
  
    // Ajouter les nouvelles URLs aux anciennes, si existantes
    setImageURLs((prevURLs) => [...prevURLs, ...urls]);
    setUploading(false);
  };
  

  const handleImageDelete = async (imageURL: string) => {
    const imageRef = ref(storage, imageURL);
    try {
      await deleteObject(imageRef);
      setImageURLs(imageURLs.filter((url) => url !== imageURL));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image :", error);
    }
  };

  return (
    <div className="EditRecette">
      <h1>Editer la recette</h1>
      {recette && (
        <div>
          <form onSubmit={handleSubmit} className="formRecette">
            <div>
              <section className="formRecette_sectionText">
                <div>
                  <label htmlFor="title">*Titre:</label>
                  <InputText
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
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

                <div>
                  <label htmlFor="type">*Type:</label>
                  <Dropdown
                    id="type"
                    value={type}
                    options={[{ name: 'Entrée', id: '1' }, { name: 'Plat', id: '2' }, {name: 'Dessert', id: '3'}]} // Exemple d'options
                    onChange={(e) => setType(e.value)}
                    optionLabel="name"
                    optionValue="id"
                  />
                </div>

                <div>
                  <label htmlFor="preparationTime">*Temps de préparation:</label>
                  <InputNumber
                    id="preparationTime"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.value ?? 0)}
                  />
                </div>
                <div>
                  <label htmlFor="cookingTime">*Temps de cuisson:</label>
                  <InputNumber
                    id="cookingTime"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.value ?? 0)}
                  />
                </div>
              </section>

              <section className="formRecette_sectionMedia">
                <div>
                  <label htmlFor="video">Vidéo:</label>
                  <InputText
                    type="text"
                    id="video"
                    value={video}
                    onChange={(e) => setVideo(e.target.value)}
                  />
                </div>
                <div className='formRecette_image'>
                  <input type="file" multiple onChange={handleFileChange} />
                  <Button onClick={handleUpload} disabled={uploading || images.length === 0} >
                    {uploading ? "Uploading..." : "Upload Images"}
                  </Button>
  
                  {imageURLs.length > 0 && (
                  <div className="uploaded-images">
                    <h3>Images existantes:</h3>
                    <section className="recette-images">
                      {imageURLs.map((url, index) => (
                        <div key={index} className="image-container">
                          <img src={url} alt="Uploaded" width="100px" />
                          <Button
                            type="button"
                            onClick={() => handleImageDelete(url)}
                            className="delete-image-btn"
                          >
                            Supprimer
                          </Button>
                        </div>
                      ))}
                    </section>
                  </div>
                  )}
                </div>
                <div>
                  <Button type="submit">Sauvegarder les modifications</Button>
                </div>
              </section>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditRecette;
