import React, { useEffect, useState } from 'react';
import './Filtre.css';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';

const Filtre: React.FC = () => {

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [position, setPosition] = useState({});
  const [departements, setDepartements] = useState([]);
  const [name, setName] = useState('');

  const navigate = useNavigate();

  const typeRecette = [
    { id: 1, name: 'Entrée' },
    { id: 2, name: 'Plat' },
    { id: 3, name: 'Dessert' },
    { id: 4, name: 'Boisson' },
  ];

  useEffect(() => {
    fetch("https://geo.api.gouv.fr/departements").then(res => res.json()).then(data => setDepartements(data));
  }, []);
  

  const useFilter = () => {
    let query = '';
    if (name) {
      query += `keywords=${encodeURIComponent(name)}&`;
    }
    if (selectedType) {
      query += `type=${encodeURIComponent(selectedType)}&`;
    }
    if (position && typeof position === 'string') {
      query += `position=${encodeURIComponent(position)}&`;
    }
    if (query.length > 0) {
      query = query.slice(0, -1);
    }
    if (query.length !== 0) {
      navigate(`/recettes?${query}`);
    }
  }

  const resetFilter = () => {
    setName('');
    setSelectedType(null);
    setPosition({});
    navigate('/recettes');
  }

  return (
    <div className="Filtre">
      <h2>Filtre</h2>
      <section className='filtre_input'>
        <div>
          <h3>Nom de la recette</h3>
          <InputText placeholder="Nom de la recette" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <h3>Type de recette:</h3>
          <div className="Filtre_type">
            {typeRecette.map((type) => (
              <div key={type.id}>
                <RadioButton inputId={type.id.toString()} name="type" value={type.name} onChange={(e) => setSelectedType(e.value)} checked={selectedType === type.name}/>
                <label htmlFor={type.id.toString()}>{type.name}</label>
              </div>
            ))}
          </div>
        </div>
        <div className='formRecette_region'>
          <h3>Département:</h3>
          <Dropdown id='position' optionLabel='nom' value={position} options={departements} onChange={(e:DropdownChangeEvent) => setPosition(e.value)} optionValue='code' />
        </div>
      </section>
      <Button label='Filtrer' className='p-button-raised p-button-rounded' onClick={useFilter}/>
      <Button label='Réinitialiser' className='p-button-raised p-button-rounded' onClick={resetFilter}/>
    </div>
  );
};

export default Filtre;
