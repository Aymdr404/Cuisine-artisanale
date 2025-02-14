import React, { useEffect, useState } from 'react';
import './PostsAdmin.css';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@firebaseModule';
import Post from '@/components/Post/Post';


interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

const PostsAdmin: React.FC = () => {

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchPosts = () => {
    setLoading(true);

    const postsQuery = query(
      collection(db, "postsRequest"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      const postsData: Post[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          content: data.content,
          createdAt: doc.data().createdAt.toDate(),
          id: doc.id,
        } as Post;
      });

      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error getting posts: ", error);
      setLoading(false);
    });

    return unsubscribe;
  };


  useEffect(() => {
    const unsubscribe = fetchPosts();

    return () => unsubscribe();
  }, []);


  return (
    <div className="PostsAdmin">
      <h1>PostsAdmin Component</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="PostsAdmin__list">
          {posts.map((post, index) => (
            <Post key={index} postId={post.id} title={post.title} content={post.content} createdAt={formatDate(post.createdAt)} fromRequest />
          ))}
        </div>
      )}
      {posts.length === 0 && !loading && <p>No posts found</p>}
    </div>
  );
};

export default PostsAdmin;
