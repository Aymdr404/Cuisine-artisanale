import React, { useEffect, useState } from 'react';
import './Posts.css';
import Post from '@/components/Post/Post';
import AddPost from '@/components/AddPost/AddPost';
import { db } from '@firebaseModule';
import { collection, getDocs, limit, onSnapshot, orderBy, query, startAfter } from 'firebase/firestore';
import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext/AuthContext';


interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

const Posts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null); // Dernier post visible pour la pagination
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);

  const nbPostsToDisplay = 3;

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
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(nbPostsToDisplay)
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

      const lastVisiblePost = querySnapshot.docs[querySnapshot.docs.length - 1];
      setPosts(postsData);
      setLastVisible(lastVisiblePost);
      setLoading(false);
      if (posts.length < nbPostsToDisplay) {
        setHasMorePosts(false);
      }
    });

    return unsubscribe;
  };

  const loadMorePosts = async () => {
    if (!lastVisible) return;

    setLoading(true);

    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(nbPostsToDisplay)
      );

      const querySnapshot = await getDocs(postsQuery);
      const postsData: Post[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          content: data.content,
          createdAt: doc.data().createdAt.toDate(),
          id: doc.id,
        } as Post;
      });

      const lastVisiblePost = querySnapshot.docs[querySnapshot.docs.length - 1];
      setPosts((prevPosts) => [...prevPosts, ...postsData]);
      setLastVisible(lastVisiblePost);

      if (querySnapshot.size < nbPostsToDisplay) {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error getting more posts: ", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = fetchPosts();

    return () => unsubscribe();
  }, []);


  return (
    <div className="Posts">
      <section className="Posts_section">
        {posts.map((post, index) => (
          <Post key={index} postId={post.id} title={post.title} content={post.content} createdAt={formatDate(post.createdAt)} />
        ))}
        <section className="LoadMore_section">
          <Button onClick={() => window.scrollTo({top: 0, behavior:'smooth'})}><i className="pi pi-angle-up" style={{ fontSize: '1.5rem' }}></i></Button>
          {!loading && hasMorePosts && lastVisible && (
            <Button onClick={loadMorePosts}>Charger plus</Button>
          )}
          {loading && <p>Chargement...</p>}
          {!hasMorePosts && <p>Il n'y a plus de posts à charger.</p>}
      </section>
      </section>
      <section className="AddPost_section">
        {user &&(
          <AddPost />
        )}
      </section>
    </div>
  );
};

export default Posts;
