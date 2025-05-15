import React, { useState } from 'react';
import './AddPost.css';
import { Button } from 'primereact/button';
import AddPostForm from '@components/AddPostForm/AddPostForm';
import { useAuth } from '@contexts/AuthContext/AuthContext';

const AddPost: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const openForm = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  return (
    <div className="AddPost">
      {/* Desktop layout */}
      <div className="desktop-post">
        <h2>Add Post</h2>
        <p>Share your thoughts with the world!</p>
        <Button onClick={openForm} disabled={!user}>
          Add Post
        </Button>
        {!user && <p>You need to be logged in to add a post</p>}
      </div>

      {/* Floating mobile button */}
      <div className="mobile-floating-button">
        <Button
          icon="pi pi-plus"
          rounded
          severity="secondary"
          aria-label="Add"
          onClick={openForm}
          disabled={!user}
        />
      </div>

      {showForm && <AddPostForm closeForm={closeForm} />}
    </div>
  );
};

export default AddPost;
