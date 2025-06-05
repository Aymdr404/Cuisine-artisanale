import React, { useEffect, useState } from 'react';
import './AddIngredientForm.css';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { Dialog } from 'primereact/dialog';
import { addDoc, collection, getDocs, query, where } from '@firebase/firestore';
import { db } from '@firebaseModule';
import { toastMessages } from '@/utils/toast';
import { useToast } from '@/contexts/ToastContext/ToastContext';

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  isActive?: boolean;
}

interface AddIngredientFormProps {
  visible: boolean;
  onHide: () => void;
}

const AddIngredientForm: React.FC<AddIngredientFormProps> = ({ visible, onHide }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [category, setCategory] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    unit?: string;
    category?: string;
  }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const { showToast } = useToast();

  const validateForm = () => {
    const errors: { name?: string; unit?: string; category?: string } = {};
    
    if (!name.trim()) {
      errors.name = 'Le nom est requis';
    }
    if (!unit) {
      errors.unit = 'L\'unité est requise';
    }
    if (!category.trim()) {
      errors.category = 'La catégorie est requise';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'ingredients'), {
        name: name.trim(),
        price: price,
        unit: unit,
        category: category.trim(),
        createdAt: new Date(),
        inStock: true
      });

      showToast({
        severity: 'success',
        summary: toastMessages.success.default,
        detail: toastMessages.success.create
      });

      setName('');
      setPrice(null);
      setUnit(null);
      setCategory('');
      onHide();
    } catch (error) {
      console.error('Error creating ingredient:', error);
      showToast({
        severity: 'error',
        summary: toastMessages.error.default,
        detail: toastMessages.error.create
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const unitsQuery = query(collection(db, 'units'));
      const querySnapshot = await getDocs(unitsQuery);
      const unitsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Unit[];

      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
      showToast({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les unités',
        life: 3000
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const ingredientsQuery = query(collection(db, 'ingredients'));
      const querySnapshot = await getDocs(ingredientsQuery);
      const uniqueCategories = [...new Set(
        querySnapshot.docs.map(doc => doc.data().category)
      )].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchCategories = (event: { query: string }) => {
    const filtered = categories.filter(cat => 
      cat.toLowerCase().includes(event.query.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  useEffect(() => {
    if (visible) {
      fetchUnits();
      fetchCategories();
    }
  }, [visible]);

  const dialogFooter = (
    <div className="form-actions">
      <Button
        type="submit"
        label="Ajouter"
        icon="pi pi-check"
        loading={loading}
        className="p-button-success"
        onClick={handleSubmit}
      />
      <Button
        type="button"
        label="Annuler"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
    </div>
  );

  return (
    <Dialog
      header="Ajouter un ingrédient"
      visible={visible}
      onHide={onHide}
      footer={dialogFooter}
      modal
      className="add-ingredient-dialog"
      closeOnEscape
      dismissableMask
    >
      <div className="form-container">
        <p className="required-field-note">* Champs requis</p>

        <div className="form-field">
          <label htmlFor="name">
            Nom <span className="required">*</span>
          </label>
          <span className="p-input-icon-right">
            <i className={name ? "pi pi-check" : "pi pi-times"}
               style={{ color: name ? 'var(--green-500)' : 'var(--red-500)' }} />
            <InputText
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormErrors({ ...formErrors, name: undefined });
              }}
              placeholder="Entrez le nom de l'ingrédient"
              className={formErrors.name ? 'p-invalid' : ''}
            />
          </span>
          {formErrors.name && <small className="p-error">{formErrors.name}</small>}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="price">Prix</label>
            <InputNumber
              id="price"
              value={price}
              onValueChange={(e) => setPrice(e.value || null)}
              mode="currency"
              currency="EUR"
              locale="fr-FR"
              placeholder="0,00 €"
              minFractionDigits={2}
            />
          </div>

          <div className="form-field">
            <label htmlFor="unit">
              Unité <span className="required">*</span>
            </label>
            <Dropdown
              id="unit"
              value={unit}
              options={units}
              onChange={(e) => {
                setUnit(e.value);
                setFormErrors({ ...formErrors, unit: undefined });
              }}
              optionLabel="name"
              placeholder="Sélectionnez une unité"
              className={formErrors.unit ? 'p-invalid' : ''}
              filter
              emptyMessage="Aucune unité trouvée"
              emptyFilterMessage="Aucune unité ne correspond"
            />
            {formErrors.unit && <small className="p-error">{formErrors.unit}</small>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="category">
            Catégorie <span className="required">*</span>
          </label>
          <AutoComplete
            id="category"
            value={category}
            suggestions={filteredCategories}
            completeMethod={searchCategories}
            onChange={(e) => {
              setCategory(e.value);
              setFormErrors({ ...formErrors, category: undefined });
            }}
            placeholder="Entrez ou sélectionnez une catégorie"
            className={formErrors.category ? 'p-invalid' : ''}
            dropdown
          />
          {formErrors.category && <small className="p-error">{formErrors.category}</small>}
        </div>
      </div>
    </Dialog>
  );
};

export default AddIngredientForm;
