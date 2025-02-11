import React, { useEffect, useState } from 'react';
import './Posts.css';
import Post from '@/components/Post/Post';
import AddPost from '@/components/AddPost/AddPost';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';


interface Post {
  title: string;
  content: string;
  createdAt: any;
  id: string;
}

const Posts: React.FC = () => {

  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsData: Post[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          content: data.content,
          createdAt: doc.data().createdAt.toDate(),
          id: doc.id
        } as Post;
      });

      setPosts(postsData);
    } catch (error) {
      console.error("Error getting posts: ", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchPosts();
  }, []);
  
  return (
    <div className="Posts">
      <section className="Posts_section">
        {posts.map((post, index) => (
          <Post key={index} postId={post.id} title={post.title} content={post.content} createdAt={formatDate(post.createdAt)} />
        ))}
      </section>
      <section className="AddPost_section">
        <AddPost />
      </section>
    </div>
  );
};

export default Posts;
