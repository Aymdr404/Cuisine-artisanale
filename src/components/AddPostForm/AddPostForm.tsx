import React, { useState } from 'react';
import './AddPostForm.css';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const AddPostForm: React.FC<{ closeForm: () => void }> = ({ closeForm }) => {

  let postId: string = '';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPostCreated, setIsPostCreated] = useState<boolean>(false); 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !content) {
      alert('Please fill out both fields');
      return;
    }

    if (!isPostCreated) {
      try {
        const docRef = await addDoc(collection(db, 'posts'), {
          title: '',
          content: '',
        });

        postId = docRef.id;
        setIsPostCreated(true);
      } catch (error) {
        console.error('Error creating post:', error);
      }

      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          title,
          content,
          id: postId,
          createdAt: new Date(),
        });

        setTitle('');
        setContent('');
        setIsPostCreated(false);
        closeForm();
      } catch (error) {
        console.error('Error updating post:', error);
      }
    }
  };

  return (
    <div className="AddPostForm">
      <form onSubmit={handleSubmit}>
        <h3>Add a post</h3>
        <div>
          <label htmlFor="title">Title:</label>
          <InputText
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <InputTextarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter post content"
          />
        </div>
        <Button type="submit" label='Submit'/>
        <br />
        <br />
        <Button label='close' onClick={closeForm} />
      </form>
    </div>
  );
};

export default AddPostForm;
