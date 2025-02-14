import React, { useEffect, useState } from 'react';
import './Users.css';

import { collection, deleteDoc, doc, getDocs } from '@firebase/firestore';
import { db } from '@firebaseModule';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';


interface User {
  userId: string;
  email: string;
  role: string;
}

const Users: React.FC = () => {

  const [users, setUsers] = useState<User[]>([]);
  
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: doc.id,
        email: data.email,
        role: data.role,
      } as User;
    });
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId)); 
    } catch (error) {
      console.error('Erreur de suppression de l\'utilisateur : ', error);
    }
  };

  // Fonction de l'éditeur pour une cellule (par exemple, éditer l'email)
  const cellEditor = (options: any) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)} // Update the value
        autoFocus
      />
    );
  };

  return (
    <div className="Users">
      <h1>Voici les différents Utilisateurs</h1>
      <DataTable value={users} tableStyle={{ minWidth: '50rem' }} paginator rows={10} editMode="cell">
        <Column field="userId" header="ID" style={{ width: '5%' }}></Column>
        <Column field="email" header="Email" editor={cellEditor}></Column>
        <Column field="role" header="Role" editor={cellEditor}></Column>
        <Column body={(rowData) => (
          <div>
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => deleteUser(rowData.userId)}
            />
          </div>
        )} header="Actions" />
      </DataTable>
    </div>
  );
};

export default Users;
