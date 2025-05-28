import React, { useEffect, useState } from 'react';
import './Posts.css';
import Post from '@/components/Post/Post';
import AddPost from '@/components/AddPost/AddPost';
import { db } from '@firebaseModule';
import { collection, getDocs, limit, onSnapshot, orderBy, query, startAfter } from 'firebase/firestore';
import { Button } from 'primereact/button';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const nbPostsToDisplay = 5; // Increased number of posts to display

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
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
      setHasMorePosts(querySnapshot.size === nbPostsToDisplay);
    });

    return unsubscribe;
  };

  const loadMorePosts = async () => {
    if (!lastVisible || loading) return;

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
      setHasMorePosts(querySnapshot.size === nbPostsToDisplay);
    } catch (error) {
      console.error("Error getting more posts: ", error);
    }

    setLoading(false);
  };

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const unsubscribe = fetchPosts();
    window.addEventListener('scroll', handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="Posts">
      <section className="Posts_section">
        {posts.map((post) => (
          <Post 
            key={post.id} 
            postId={post.id} 
            title={post.title} 
            content={post.content} 
            createdAt={formatDate(post.createdAt)} 
          />
        ))}
        <section className="LoadMore_section">
          {loading ? (
            <div className="loading-spinner">
              <i className="pi pi-spinner"></i>
              <span>Chargement des posts...</span>
            </div>
          ) : hasMorePosts ? (
            <Button 
              onClick={loadMorePosts}
              icon="pi pi-plus"
              label="Charger plus de posts"
              className="p-button-outlined"
            />
          ) : (
            <div className="no-more-posts">
              <i className="pi pi-check-circle" style={{ marginRight: '0.5rem' }}></i>
              Vous avez vu tous les posts !
            </div>
          )}
        </section>
      </section>

      <section className="AddPost_section">
        <AddPost />
      </section>

      <button 
        className={`scroll-top-button ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Retour en haut"
      >
        <i className="pi pi-angle-up" style={{ fontSize: '1.5rem' }}></i>
      </button>
    </div>
  );
};

export default Posts;

