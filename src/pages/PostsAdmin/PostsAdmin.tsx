import React, { useEffect, useState, useRef } from 'react';
import './PostsAdmin.css';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@firebaseModule';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

const PostsAdmin: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const fetchPosts = () => {
    try {
      setLoading(true);
      const postsQuery = query(
        collection(db, "postsRequest"),
        orderBy(sortField, sortOrder)
      );

      const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
        const postsData: Post[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            title: data.title,
            content: data.content,
            createdAt: data.createdAt.toDate(),
            id: doc.id,
            author: data.author || 'Anonyme',
            status: data.status || 'pending'
          } as Post;
        });

        setPosts(postsData);
        setLoading(false);
      }, (error) => {
        console.error("Error getting posts: ", error);
        toast.current?.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les posts',
          life: 3000
        });
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error in fetchPosts:", error);
      setLoading(false);
      return () => {};
    }
  };

  useEffect(() => {
    const unsubscribe = fetchPosts();
    return () => unsubscribe();
  }, [sortField, sortOrder]);

  const handleAcceptPost = async (post: Post) => {
    try {
      // Add to posts collection
      await addDoc(collection(db, 'posts'), {
        title: post.title,
        content: post.content,
        createdAt: new Date(),
        likes: []
      });

      // Delete from postsRequest
      await deleteDoc(doc(db, 'postsRequest', post.id));
      
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Le post a été accepté et publié.',
        life: 3000
      });
    } catch (error) {
      console.error('Error accepting post:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de l\'acceptation du post.',
        life: 3000
      });
    }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'postsRequest', postId));
      toast.current?.show({
        severity: 'info',
        summary: 'Post rejeté',
        detail: 'Le post a été rejeté avec succès.',
        life: 3000
      });
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du rejet du post.',
        life: 3000
      });
    }
  };

  const confirmReject = (post: Post) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir rejeter le post "${post.title}" ?`,
      header: 'Confirmation de rejet',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => handleRejectPost(post.id)
    });
  };

  const confirmAccept = (post: Post) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir accepter et publier le post "${post.title}" ?`,
      header: 'Confirmation de publication',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => handleAcceptPost(post)
    });
  };

  const confirmDelete = (postId: string, title: string) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer le post "${title}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => handleDelete(postId)
    });
  };

  const handleDelete = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'postsRequest', postId));
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Post supprimé avec succès',
        life: 3000
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer le post',
        life: 3000
      });
    }
  };

  const handleSortChange = (e: { value: string }) => {
    const [field, order] = e.value.split(':');
    setSortField(field);
    setSortOrder(order as 'asc' | 'desc');
  };

  const header = () => {
    return (
      <div className="posts-header">
        <h2>Gestion des Posts</h2>
        <div className="posts-header-actions">
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
  

  const itemTemplate = (post: Post) => {
    const statusColors = {
      pending: 'var(--warning-color)',
      approved: 'var(--success-color)',
      rejected: 'var(--danger-color)'
    };

    return (
      <div className="post-card">
        <div className="post-card-header">
          <h3>{post.title}</h3>
          <span 
            className="post-status"
            style={{ backgroundColor: statusColors[post.status || 'pending'] }}
          >
            {post.status === 'pending' ? 'En attente' : 
             post.status === 'approved' ? 'Approuvé' : 'Rejeté'}
          </span>
        </div>
        <div className="post-card-content">
          <p>{post.content}</p>
        </div>
        <div className="post-card-footer">
          <div className="post-info">
            <span className="post-author">
              <i className="pi pi-user" /> {post.author}
            </span>
            <span className="post-date">
              <i className="pi pi-calendar" /> {formatDate(post.createdAt)}
            </span>
          </div>
          <div className="post-actions">
            <Button
              icon="pi pi-check"
              className="p-button-rounded p-button-success p-button-text"
              onClick={() => confirmAccept(post)}
              tooltip="Approuver"
            />
            <Button
              icon="pi pi-times"
              className="p-button-rounded p-button-warning p-button-text"
              onClick={() => confirmReject(post)}
              tooltip="Rejeter"
            />
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger p-button-text"
              onClick={() => confirmDelete(post.id, post.title)}
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
        <p>Chargement des posts...</p>
      </div>
    );
  }

  return (
    <div className="posts-admin">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <DataView
        value={posts.filter(post => 
          post.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
          post.content.toLowerCase().includes(globalFilter.toLowerCase()) ||
          post.author?.toLowerCase().includes(globalFilter.toLowerCase())
        )}
        layout="grid"
        header={header()}
        itemTemplate={itemTemplate}
        paginator
        rows={9}
        emptyMessage="Aucun post trouvé"
      />
    </div>
  );
};

export default PostsAdmin;
