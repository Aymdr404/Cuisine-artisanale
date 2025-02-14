import React, { useEffect, useState } from 'react';
import './IngredientsAdmin.css';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AddIngredient from '@/components/AddIngredient/AddIngredient';

import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@firebaseModule';
import { Button } from 'primereact/button';



interface Ingredient {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
}

const IngredientsAdmin: React.FC = () => {

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  const handlefetchIngredients = () => {
    setLoading(true);

    const ingredientsQuery = query(
      collection(db, "ingredients"),
      orderBy("name", "asc"),
    );

    const unsubscribe = onSnapshot(ingredientsQuery, (querySnapshot) => {
      const ingredientsData: Ingredient[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          price: data.price,
          unit: data.unit,
          category: data.category,
          id: doc.id,
        } as Ingredient;
      });

      setIngredients(ingredientsData);
      setLoading(false);
    }, (error) => {
      console.error("Error getting ingredients: ", error);
      setLoading(false);
    });

    return unsubscribe;
  }

  useEffect(() => {
    const unsubscribe = handlefetchIngredients();

    return () => {
      unsubscribe();
    }
  }, []);

  const deleteIngredients = async (ingredientId: string) => {
    try {
      const userRef = doc(db, 'ingredients', ingredientId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Erreur de suppression de l\'ingredient : ', error);
    }
  };


  return (
    <div className="IngredientsAdmin">
      <h1>IngredientsAdmin Component</h1>
      <section className="container">
        <div className='button-container'>
          <AddIngredient />
        </div>
        <div className='table-container'>
          <DataTable value={ingredients} tableStyle={{ minWidth: '50rem' }} paginator rows={10} loading={loading}>
            <Column field="id" header="ID"></Column>
            <Column field="name" header="Name"></Column>
            <Column field="price" header="Price"></Column>
            <Column field="unit" header="Unit"></Column>
            <Column field="category" header="Category"></Column>
            <Column body={(rowData) => (
              <div>
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger"
                  onClick={() => deleteIngredients(rowData.id)}
                />
              </div>
            )} header="Actions" />
          </DataTable>
        </div>
      </section>
    </div>
  );
};

export default IngredientsAdmin;
