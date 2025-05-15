import React, { useState } from 'react';
import './AddPost.css';
import { Button } from 'primereact/button';
import AddPostForm from '@components/AddPostForm/AddPostForm';
import { useAuth } from '@contexts/AuthContext/AuthContext';
import { toast } from 'react-toastify';

const AddPost: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const openForm = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  const handleMobileClick = () => {
    if (user) {
      openForm();
    } else {
      toast.info('Vous devez être connecté pour publier un post.');
    }
  };

  return (
    <div className="AddPost">
      {/* Desktop layout */}
      <div className="desktop-post">
        <h2>Ajouter un post</h2>
        <p>Partagez vos pensées avec le monde !</p>
        <Button onClick={openForm} disabled={!user}>
          Ajouter un post
        </Button>
        {!user && <p>Vous devez être connecté pour ajouter un post</p>}
      </div>

      {/* Floating mobile button */}
      <div className="mobile-floating-button">
        <Button
          icon="pi pi-plus"
          aria-label="Ajouter un post"
          onClick={handleMobileClick}
          className="p-button-rounded p-button-lg"
          text
        />
      </div>

      {showForm && <AddPostForm closeForm={closeForm} />}
    </div>
  );
};

export default AddPost;
