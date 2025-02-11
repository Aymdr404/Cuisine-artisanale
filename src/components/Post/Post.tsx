import React, { useEffect, useState } from 'react';
import './Post.css';
import { Button } from 'primereact/button';
import { toggleLikePost, unlikePost } from '@/services/PostService/PostService';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { doc, onSnapshot } from '@firebase/firestore';

import { db } from '../../firebase';


interface PostProps {
  postId,
  title: string;
  content: string;
  createdAt: any;
}

const Post: React.FC<PostProps> = ({postId, title, content, createdAt}) => {

  const { user } = useAuth();
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



  return (
    <div className="Post">
      <h1>{title}</h1>
      <p>{content}</p>
      <p>{createdAt}</p>
      <Button className='Post_likeButton'
        label={hasLiked ? `❤️ ${likes.length}` : `🤍 ${likes.length}`}
        onClick={handleLike}
        severity={hasLiked ? "danger" : "secondary"}
      />
    </div>
  );
};

export default Post;
