import React, { useEffect, useState } from 'react';
import './Post.css';
import { Button } from 'primereact/button';
import { toggleLikePost, unlikePost } from '@/services/PostService/PostService';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from '@firebase/firestore';

import { db } from '@firebaseModule';
import { ConfirmDialog } from 'primereact/confirmdialog';


interface PostProps {
  postId: string;
  title: string;
  content: string;
  createdAt: any;
  fromRequest?: boolean;
}

const Post: React.FC<PostProps> = ({postId, title, content, createdAt, fromRequest = false}) => {

  const { user, role } = useAuth();
  const [likes, setLikes] = useState<string[]>([]);
  const userId = user?.uid;

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "posts", postId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setLikes(docSnapshot.data().likes || []);
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const hasLiked = userId ? likes.includes(userId) : false;

  const handleLike = async () => {
    if (!userId) return alert("You must be logged in to like a post!");
    if (hasLiked) {
      await unlikePost(postId, userId);
    } else {
      await toggleLikePost(postId, userId);
    }
  };

  const handleDelete = async () => {
    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
    } catch (error) {
      console.error('Erreur de suppression du post : ', error);
    }
  };

  const handleAcceptRequest = async () => {
  let postIdNew: string | undefined;

    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        title: '',
        content: '',
      });
      postIdNew = docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
    }

    if (postIdNew) {
      try {
        const postRef = doc(db, 'posts', postIdNew);
        await updateDoc(postRef, {
          title,
          content,
          id: postId,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating post:', error);
      }
    } else {
      console.error('postIdNew is undefined');
    }
    await declineRequest();
  }

  const declineRequest = async () => {
    try {
      const postRef = doc(db, 'postsRequest', postId);
      await deleteDoc(postRef);
    } catch (error) {
      console.error('Erreur de suppression de l\'utilisateur : ', error);
    }
  }

  return (
    <div className={`Post ${fromRequest ? 'Post_request' : ''}`}>
      <h1>{title}</h1>
      <p>{content}</p>
      <section className='Section_buttons'>
        {(!fromRequest && 
          <Button className='Post_likeButton' onClick={handleLike} severity={hasLiked ? "danger" : "secondary"} >
              {hasLiked ? `❤️ ${likes.length}` : `🤍 ${likes.length}`}
          </Button>
        )}
        {role === 'admin' && !fromRequest &&(
          <div>
            <ConfirmDialog />
            <Button className='Post_deleteButton' label="Delete" icon="pi pi-trash" onClick={handleDelete}/>
            <p>{createdAt}</p>
          </div>         
        )}
        {fromRequest && role === 'admin' && (
          <div className='Post_acceptButton'>
            <Button className='Post_acceptButton' label="Accept" icon="pi pi-check" onClick={handleAcceptRequest}/>
            <Button className='Post_declineButton' label="Decline" icon="pi pi-times" onClick={declineRequest}/>
          </div>
        )}
      </section>
    </div>
  );
};

export default Post;