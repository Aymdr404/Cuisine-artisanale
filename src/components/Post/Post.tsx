import React, { useEffect, useState } from 'react';
import './Post.css';
import { Button } from 'primereact/button';
import { toggleLikePost, unlikePost } from '@/services/PostService/PostService';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { deleteDoc, doc, onSnapshot, updateDoc } from '@firebase/firestore';
import { db } from '@firebaseModule';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

interface PostProps {
  postId: string;
  title: string;
  content: string;
  createdAt: string;
  fromRequest?: boolean;
  visible?: boolean;
}

const Post: React.FC<PostProps> = ({ postId, title, content, createdAt, fromRequest = false, visible = true }) => {
  const { user, role } = useAuth();
  const [likes, setLikes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(visible);
  const userId = user?.uid;
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "posts", postId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setLikes(data.likes || []);
        setIsVisible(data.visible !== false); // Default to true if not set
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const hasLiked = userId ? likes.includes(userId) : false;

  const handleLike = async () => {
    if (!userId) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Connexion requise',
        detail: 'Vous devez être connecté pour aimer un post.',
        life: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      if (hasLiked) {
        await unlikePost(postId, userId);
      } else {
        await toggleLikePost(postId, userId);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de l\'action.',
        life: 3000
      });
    }
    setIsLoading(false);
  };

  const handleVisibilityToggle = async () => {
    setIsLoading(true);
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        visible: !isVisible
      });
      setIsVisible(!isVisible);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: `Le post est maintenant ${!isVisible ? 'visible' : 'masqué'}.`,
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du changement de visibilité.',
        life: 3000
      });
    }
    setIsLoading(false);
  };

  const confirmDelete = () => {
    confirmDialog({
      message: 'Êtes-vous sûr de vouloir supprimer ce post ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: handleDelete
    });
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Le post a été supprimé.',
        life: 3000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la suppression du post.',
        life: 3000
      });
    }
    setIsLoading(false);
  };

  return (
    <div className={`Post ${fromRequest ? 'Post_request' : ''} ${!isVisible ? 'Post-hidden' : ''}`}>
      <Toast ref={toast} />
      
      <h1>{title}</h1>
      <p style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
      
      <section className='Section_buttons'>
        {!fromRequest && (
          <Button 
            className='Post_likeButton'
            onClick={handleLike}
            disabled={isLoading}
            severity={hasLiked ? "danger" : "secondary"}
            icon={hasLiked ? "pi pi-heart-fill" : "pi pi-heart"}
            label={likes.length.toString()}
          />
        )}

        {role === 'admin' && !fromRequest && (
          <div className='Post_admin_actions'>
            <Button 
              className='Post_visibilityButton'
              label={isVisible ? "Masquer" : "Afficher"}
              icon={isVisible ? "pi pi-eye-slash" : "pi pi-eye"}
              onClick={handleVisibilityToggle}
              disabled={isLoading}
              severity={isVisible ? "warning" : "success"}
            />
            <Button 
              className='Post_deleteButton'
              label="Supprimer"
              icon="pi pi-trash"
              onClick={confirmDelete}
              disabled={isLoading}
              severity="danger"
            />
            <span className="post-date">{createdAt}</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default Post;