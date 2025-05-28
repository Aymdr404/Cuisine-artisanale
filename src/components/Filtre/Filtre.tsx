import React, { useEffect, useState } from 'react';
import './Filtre.css';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';

interface Departement {
  nom: string;
  code: string;
}

const Filtre: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [position, setPosition] = useState<Departement | null>(null);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const typeRecette = [
    { id: 1, name: 'Entrée' },
    { id: 2, name: 'Plat' },
    { id: 3, name: 'Dessert' },
    { id: 4, name: 'Boisson' },
  ];

  useEffect(() => {
    const fetchDepartements = async () => {
      try {
        const response = await fetch("https://geo.api.gouv.fr/departements");
        const data = await response.json();
        setDepartements(data);
      } catch (error) {
        console.error('Error fetching departements:', error);
      }
    };
    fetchDepartements();
  }, []);

  const useFilter = () => {
    setIsLoading(true);
    const queryParams = new URLSearchParams();

    if (name) {
      queryParams.append('keywords', name);
    }
    if (selectedType) {
      queryParams.append('type', selectedType);
    }
    if (position?.code) {
      queryParams.append('position', position.code);
    }

    const query = queryParams.toString();
    navigate(query ? `/recettes?${query}` : '/recettes');
    setIsLoading(false);
  };

  const resetFilter = () => {
    setName('');
    setSelectedType(null);
    setPosition(null);
    navigate('/recettes');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      useFilter();
    }
  };

  return (
    <div className="Filtre">
      <h2>Filtrer les recettes</h2>
      
      <section className='filtre_input'>
        <div>
          <h3>Nom de la recette</h3>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText 
              placeholder="Rechercher une recette..." 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </span>
        </div>

        <div>
          <h3>Type de recette</h3>
          <div className="Filtre_type">
            {typeRecette.map((type) => (
              <div key={type.id}>
                <RadioButton 
                  inputId={type.id.toString()} 
                  name="type" 
                  value={type.name} 
                  onChange={(e) => setSelectedType(e.value)} 
                  checked={selectedType === type.name}
                />
                <label htmlFor={type.id.toString()}>{type.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className='formRecette_region'>
          <h3>Département</h3>
          <Dropdown 
            id='position' 
            value={position} 
            options={[
              { nom: "Tous les départements", code: '' },
              ...departements
            ]} 
            onChange={(e: DropdownChangeEvent) => setPosition(e.value)}
            optionLabel="nom"
            placeholder="Sélectionner un département"
            className="w-full"
          />
        </div>
      </section>

      <div className="filtre_buttons">
        <Button 
          label='Filtrer' 
          icon="pi pi-filter"
          loading={isLoading}
          onClick={useFilter}
        />
        <Button 
          label='Réinitialiser' 
          icon="pi pi-refresh"
          className="p-button-secondary"
          onClick={resetFilter}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default Filtre;
