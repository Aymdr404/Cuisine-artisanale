import React, { useState } from 'react';
import './AddPost.css';
import { Button } from 'primereact/button';
import AddPostForm from '@components/AddPostForm/AddPostForm';

const AddPost: React.FC = () => {
  
  const [showForm, setShowForm] = useState(false);

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  return (
    <div className='AddPost'>
      <h2>Add Post</h2>
      <p>Share your thoughts with the world!</p>
      <br />
      <br />
      <br />
      <Button onClick={openForm}>Add Post</Button>

      {showForm && <AddPostForm closeForm={closeForm} />}
    </div>
  );
};

export default AddPost;
