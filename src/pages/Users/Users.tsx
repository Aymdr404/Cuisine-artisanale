import React, { useEffect, useState, useRef } from 'react';
import './Users.css';
import { collection, deleteDoc, doc, getDocs, updateDoc } from '@firebase/firestore';
import { db } from '@firebaseModule';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ProgressSpinner } from 'primereact/progressspinner';

interface User {
  userId: string;
  email: string;
  role: string;
  createdAt?: Date;
  lastLogin?: Date;
  displayName?: string;
  photoURL?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const toast = useRef<Toast>(null);

  const roles = [
    { label: 'Utilisateur', value: 'user' },
    { label: 'Administrateur', value: 'admin' }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          userId: doc.id,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt?.toDate(),
          lastLogin: data.lastLogin?.toDate(),
          displayName: data.displayName,
          photoURL: data.photoURL
        } as User;
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les utilisateurs',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const confirmDelete = (userId: string, email: string) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${email} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => deleteUser(userId)
    });
  };

  const deleteUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Utilisateur supprimé avec succès',
        life: 3000
      });
    } catch (error) {
      console.error('Erreur de suppression de l\'utilisateur:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer l\'utilisateur',
        life: 3000
      });
    }
  };

  const onCellEditComplete = async (e: any) => {
    const { newValue, field, rowData } = e;
    try {
      const userRef = doc(db, 'users', rowData.userId);
      await updateDoc(userRef, { [field]: newValue });
      
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === rowData.userId ? { ...user, [field]: newValue } : user
        )
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Utilisateur mis à jour avec succès',
        life: 3000
      });
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de mettre à jour l\'utilisateur',
        life: 3000
      });
    }
  };

  const roleEditor = (options: any) => {
    return (
      <Dropdown
        value={options.value}
        options={roles}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Sélectionner un rôle"
      />
    );
  };

  const cellEditor = (options: any) => {
    return (
      <InputText
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
        autoFocus
      />
    );
  };

  const header = (
    <div className="table-header">
      <h2>Gestion des Utilisateurs</h2>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Rechercher..."
          onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
        />
      </span>
    </div>
  );

  const dateTemplate = (rowData: User, field: 'createdAt' | 'lastLogin') => {
    return rowData[field]?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) || '-';
  };

  const avatarTemplate = (rowData: User) => {
    return (
      <div className="user-avatar">
        {rowData.photoURL ? (
          <img src={rowData.photoURL} alt={rowData.displayName || 'User'} />
        ) : (
          <i className="pi pi-user" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <ProgressSpinner />
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <DataTable
        value={users}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        globalFilter={globalFilter}
        header={header}
        emptyMessage="Aucun utilisateur trouvé"
        className="user-table"
        editMode="cell"
        dataKey="userId"
        responsiveLayout="scroll"
        showGridlines
      >
        <Column
          header="Avatar"
          body={avatarTemplate}
          style={{ width: '80px' }}
        />
        <Column
          field="displayName"
          header="Nom"
          sortable
        />
        <Column
          field="email"
          header="Email"
          sortable
          editor={(options) => cellEditor(options)}
          onCellEditComplete={onCellEditComplete}
        />
        <Column
          field="role"
          header="Rôle"
          sortable
          editor={roleEditor}
          onCellEditComplete={onCellEditComplete}
          body={(rowData) => roles.find(r => r.value === rowData.role)?.label || rowData.role}
        />
        <Column
          field="createdAt"
          header="Créé le"
          sortable
          body={(rowData) => dateTemplate(rowData, 'createdAt')}
        />
        <Column
          field="lastLogin"
          header="Dernière connexion"
          sortable
          body={(rowData) => dateTemplate(rowData, 'lastLogin')}
        />
        <Column
          body={(rowData) => (
            <div className="action-buttons">
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-text"
                onClick={() => confirmDelete(rowData.userId, rowData.email)}
                tooltip="Supprimer"
                tooltipOptions={{ position: 'left' }}
              />
            </div>
          )}
          header="Actions"
          style={{ width: '100px' }}
        />
      </DataTable>
    </div>
  );
};

export default Users;
