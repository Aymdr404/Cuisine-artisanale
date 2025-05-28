import React, { useState } from 'react';
import './AddPostForm.css';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

import { db } from '@firebaseModule';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@contexts/AuthContext/AuthContext';

interface AddPostFormProps {
  closeForm: () => void;
}

const AddPostForm: React.FC<AddPostFormProps> = ({ closeForm }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous'
      });
      closeForm();
    } catch (error) {
      console.error('Error adding post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AddPostForm" >
      <form className="formPost" onSubmit={handleSubmit}>
        <h3>Nouveau Post</h3>
        <div>
          <label htmlFor="title">Titre</label>
          <InputText
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entrez le titre"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="content">Contenu</label>
          <InputTextarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez votre post ici..."
            required
            rows={5}
            autoResize
          />
        </div>
        <div className="buttons-form">
          <Button
            type="button"
            label="Annuler"
            className="p-button-outlined"
            onClick={closeForm}
            disabled={loading}
          />
          <Button
            type="submit"
            label="Publier"
            loading={loading}
            disabled={!title.trim() || !content.trim()}
          />
        </div>
      </form>
    </div>
  );
};

export default AddPostForm;
