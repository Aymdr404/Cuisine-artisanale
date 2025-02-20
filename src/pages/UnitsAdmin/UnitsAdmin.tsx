import React, { useEffect, useState } from 'react';
import './UnitsAdmin.css';
import AddUnit from '@components/AddUnit/AddUnit';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { collection, onSnapshot, orderBy, query } from '@firebase/firestore';
import { db } from '@firebaseModule';

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

const UnitsAdmin: React.FC = () => {

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetchUnits = () => {
    setLoading(true);

    const unitQuery = query(
      collection(db, "units"),
      orderBy("name", "asc"),
    );

    const unsubscribe = onSnapshot(unitQuery, (querySnapshot) => {
      const unitsData: Unit[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          abbreviation: data.abbreviation,
          id: doc.id,
        } as Unit;
      });

      setUnits(unitsData);
      setLoading(false);
    }, (error) => {
      console.error("Error getting units: ", error);
      setLoading(false);
    });

    return unsubscribe;
  }

  useEffect(() => {
    const unsubscribe = handleFetchUnits();

    return () => {
      unsubscribe();
    }
  }
  , []);

  return (
    <div className="UnitsAdmin">
      <div className='button-container'>
        <AddUnit />
      </div>
      <div className='units-container'>
        <DataTable value={units} loading={loading}>
          <Column field="name" header="Name"></Column>
          <Column field="abbreviation" header="Abbreviation"></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default UnitsAdmin;
