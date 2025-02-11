import React from 'react';
import './Post.css';


interface PostProps {
  title: string;
  content: string;
  createdAt: any;
}

const Post: React.FC<PostProps> = ({title, content, createdAt}) => {
  return (
    <div className="Post">
      <h1>{title}</h1>
      <p>{content}</p>
      <p>{createdAt}</p>
    </div>
  );
};

export default Post;
