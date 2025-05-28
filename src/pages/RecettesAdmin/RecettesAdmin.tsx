import React, { useEffect, useState, useRef } from 'react';
import './RecettesAdmin.css';
import { db } from '@firebaseModule';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc, getDoc, addDoc } from '@firebase/firestore';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';

interface RecetteInterface {
  recetteId: string;
  title: string;
  type: string;
  createdBy: string;
  createdAt: Date;
  status?: 'pending' | 'approved' | 'rejected';
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  images?: string[];
}

const RecettesAdmin: React.FC = () => {
  const [recettes, setRecettes] = useState<RecetteInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const toast = useRef<Toast>(null);

  const sortOptions = [
    { label: 'Plus récent', value: 'createdAt:desc' },
    { label: 'Plus ancien', value: 'createdAt:asc' },
    { label: 'Titre A-Z', value: 'title:asc' },
    { label: 'Titre Z-A', value: 'title:desc' }
  ];

  const difficultyOptions = {
    easy: { label: 'Facile', color: 'var(--success-color)' },
    medium: { label: 'Moyen', color: 'var(--warning-color)' },
    hard: { label: 'Difficile', color: 'var(--danger-color)' }
  };

  const fetchRecettes = () => {
    try {
      setLoading(true);
      const recettesCollection = query(
        collection(db, "recipesRequest"),
        orderBy(sortField, sortOrder)
      );

      const unsubscribe = onSnapshot(recettesCollection, (querySnapshot) => {
        const recettesData: RecetteInterface[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            recetteId: doc.id,
            createdAt: data.createdAt?.toDate(),
            images: data.images || [],
            status: data.status || 'pending'
          } as RecetteInterface;
        });
        setRecettes(recettesData);
        setLoading(false);
      }, (error) => {
        console.error("Error getting recettes: ", error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les recettes',
          life: 3000
        });
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error in fetchRecettes:", error);
      setLoading(false);
      return () => {};
    }
  };

  useEffect(() => {
    const unsubscribe = fetchRecettes();
    return () => unsubscribe();
  }, [sortField, sortOrder]);

  const handleAcceptRequest = async (recette: RecetteInterface) => {
    try {
      // Get the full recipe data
      const recetteRef = doc(db, 'recipesRequest', recette.recetteId);
      const recetteSnap = await getDoc(recetteRef);
      if (!recetteSnap.exists()) {
        toast.current?.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Recette introuvable',
          life: 3000
        });
        return;
      }

      const recetteData = recetteSnap.data();
      
      // Add to recipes collection
      await addDoc(collection(db, 'recipes'), {
        ...recetteData,
        createdAt: new Date(),
        likes: []
      });

      // Delete from recipesRequest
      await deleteDoc(recetteRef);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'La recette a été acceptée et publiée',
        life: 3000
      });
    } catch (error) {
      console.error('Error accepting recipe:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de l\'acceptation de la recette',
        life: 3000
      });
    }
  };

  const handleRejectRequest = async (recetteId: string) => {
    try {
      await deleteDoc(doc(db, 'recipesRequest', recetteId));
      toast.current?.show({
        severity: 'info',
        summary: 'Recette rejetée',
        detail: 'La recette a été rejetée avec succès',
        life: 3000
      });
    } catch (error) {
      console.error('Error rejecting recipe:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du rejet de la recette',
        life: 3000
      });
    }
  };

  const confirmAccept = (recette: RecetteInterface) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir accepter et publier la recette "${recette.title}" ?`,
      header: 'Confirmation de publication',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => handleAcceptRequest(recette)
    });
  };

  const confirmReject = (recette: RecetteInterface) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir rejeter la recette "${recette.title}" ?`,
      header: 'Confirmation de rejet',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => handleRejectRequest(recette.recetteId)
    });
  };

  const confirmDelete = (recetteId: string, title: string) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer la recette "${title}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => handleDelete(recetteId)
    });
  };

  const handleDelete = async (recetteId: string) => {
    try {
      await deleteDoc(doc(db, 'recipesRequest', recetteId));
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Recette supprimée avec succès',
        life: 3000
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer la recette',
        life: 3000
      });
    }
  };

  const handleSortChange = (e: { value: string }) => {
    const [field, order] = e.value.split(':');
    setSortField(field);
    setSortOrder(order as 'asc' | 'desc');
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'Non spécifié';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}min` : ''}`;
  };

  const header = () => {
    return (
      <div className="recipes-header">
        <h2>Gestion des Recettes</h2>
        <div className="recipes-header-actions">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Rechercher..."
            />
          </span>
          <Dropdown
            value={`${sortField}:${sortOrder}`}
            options={sortOptions}
            onChange={handleSortChange}
            className="sort-dropdown"
          />
        </div>
      </div>
    );
  };

  const itemTemplate = (recette: RecetteInterface) => {
    const statusColors = {
      pending: 'var(--warning-color)',
      approved: 'var(--success-color)',
      rejected: 'var(--danger-color)'
    };

    return (
      <div className="recipe-card">
        <div className="recipe-card-header">
          <div className="recipe-title-section">
            <h3>{recette.title}</h3>
            <Tag
              value={recette.type}
              severity="info"
              className="recipe-type-tag"
            />
          </div>
          <span 
            className="recipe-status"
            style={{ backgroundColor: statusColors[recette.status || 'pending'] }}
          >
            {recette.status === 'pending' ? 'En attente' : 
             recette.status === 'approved' ? 'Approuvée' : 'Rejetée'}
          </span>
        </div>

        <div className="recipe-card-content">
          {recette.images && recette.images.length > 0 && (
            <div className="recipe-images">
              <Image
                src={recette.images[0]}
                alt={recette.title}
                width="100"
                preview
              />
              {recette.images.length > 1 && (
                <span className="image-count">+{recette.images.length - 1}</span>
              )}
            </div>
          )}
          
          <div className="recipe-details">
            {recette.description && <p>{recette.description}</p>}
            <div className="recipe-metadata">
              {recette.prepTime && (
                <span className="metadata-item">
                  <i className="pi pi-clock" /> Préparation: {formatTime(recette.prepTime)}
                </span>
              )}
              {recette.cookTime && (
                <span className="metadata-item">
                  <i className="pi pi-stopwatch" /> Cuisson: {formatTime(recette.cookTime)}
                </span>
              )}
              {recette.servings && (
                <span className="metadata-item">
                  <i className="pi pi-users" /> {recette.servings} portions
                </span>
              )}
              {recette.difficulty && (
                <Tag
                  value={difficultyOptions[recette.difficulty].label}
                  severity="info"
                  style={{ backgroundColor: difficultyOptions[recette.difficulty].color }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="recipe-card-footer">
          <div className="recipe-info">
            <span className="recipe-author">
              <i className="pi pi-user" /> {recette.createdBy}
            </span>
            {recette.createdAt && (
              <span className="recipe-date">
                <i className="pi pi-calendar" /> {recette.createdAt.toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
          <div className="recipe-actions">
            <Button
              icon="pi pi-check"
              className="p-button-rounded p-button-success p-button-text"
              onClick={() => confirmAccept(recette)}
              tooltip="Approuver"
              disabled={recette.status === 'approved'}
            />
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-warning p-button-text"
              onClick={() => confirmReject(recette)}
              tooltip="Rejeter"
              disabled={recette.status === 'rejected'}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger p-button-text"
              onClick={() => confirmDelete(recette.recetteId, recette.title)}
              tooltip="Supprimer"
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <ProgressSpinner />
        <p>Chargement des recettes...</p>
      </div>
    );
  }

  return (
    <div className="recipes-admin">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <DataView
        value={recettes.filter(recette => 
          recette.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
          recette.type.toLowerCase().includes(globalFilter.toLowerCase()) ||
          recette.createdBy.toLowerCase().includes(globalFilter.toLowerCase()) ||
          recette.description?.toLowerCase().includes(globalFilter.toLowerCase())
        )}
        layout="grid"
        header={header()}
        itemTemplate={itemTemplate}
        paginator
        rows={6}
        emptyMessage="Aucune recette trouvée"
      />
    </div>
  );
};

export default RecettesAdmin;
