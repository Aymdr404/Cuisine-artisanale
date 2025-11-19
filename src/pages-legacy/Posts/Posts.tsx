"use client";
import React, { useEffect, useState, useMemo, Suspense } from 'react';
import './Posts.css';
import AddPost from '@/components/AddPost/AddPost';
import { db } from '@firebaseModule';
import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '@/contexts/AuthContext/AuthContext';

// Lazy-load du composant Post
const PostComponent = React.lazy(() => import('@/components/Post/Post'));

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  visible?: boolean;
  userName: string;
}

const nbPostsToDisplay = 5;

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { role, user } = useAuth();

  const formatDate = (date: Date) =>
	date.toLocaleDateString("fr-FR", {
	  weekday: "long",
	  year: "numeric",
	  month: "long",
	  day: "numeric",
	  hour: "2-digit",
	  minute: "2-digit"
	});

  // 📌 Initial fetch des posts
  const fetchInitialPosts = async () => {
	setLoading(true);
	try {
	  const postsQuery = query(
		collection(db, "posts"),
		orderBy("createdAt", "desc"),
		limit(nbPostsToDisplay)
	  );
	  const querySnapshot = await getDocs(postsQuery);
	  const postsData: Post[] = querySnapshot.docs.map((doc) => {
		const data = doc.data();
		return {
		  id: doc.id,
		  title: data.title,
		  content: data.content,
		  createdAt: data.createdAt.toDate(),
		  visible: data.visible !== false,
		  userName: data.userName
		} as Post;
	  });
	  setPosts(postsData);
	  setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
	  setHasMorePosts(querySnapshot.size === nbPostsToDisplay);
	} catch (error) {
	  console.error("Error fetching posts:", error);
	}
	setLoading(false);
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
		  id: doc.id,
		  title: data.title,
		  content: data.content,
		  createdAt: data.createdAt.toDate(),
		  visible: data.visible !== false,
		  userName: data.userName
		} as Post;
	  });
	  setPosts((prev) => [...prev, ...postsData]);
	  setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
	  setHasMorePosts(querySnapshot.size === nbPostsToDisplay);
	} catch (error) {
	  console.error("Error loading more posts:", error);
	}
	setLoading(false);
  };

  // 👀 Scroll to top
  const handleScroll = () => setShowScrollTop(window.scrollY > 300);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
	fetchInitialPosts();
	window.addEventListener('scroll', handleScroll);
	return () => window.removeEventListener('scroll', handleScroll);
  }, [user, role]);

  // Filtrer les posts selon le rôle (memoized)
  const visiblePosts = useMemo(() => {
	return posts.filter(post => post.visible || role === 'admin');
  }, [posts, role]);

  return (
	<div className="Posts">
	  <ConfirmDialog />
	  <section className="Posts_section">

		{/* Skeleton UI si aucun post chargé */}
		{loading && visiblePosts.length === 0 && (
		  Array.from({ length: nbPostsToDisplay }).map((_, i) => (
			<div key={i} className="post-skeleton">
			  <div className="skeleton-title"></div>
			  <div className="skeleton-content"></div>
			</div>
		  ))
		)}

		{/* Liste des posts */}
		{visiblePosts.map((post) => (
		  <Suspense key={post.id} fallback={
			<div className="post-skeleton">
			  <div className="skeleton-title"></div>
			  <div className="skeleton-content"></div>
			</div>
		  }>
			<PostComponent
			  postId={post.id}
			  title={post.title}
			  content={post.content}
			  createdAt={formatDate(post.createdAt)}
			  visible={post.visible}
			  userName={post.userName}
			/>
		  </Suspense>
		))}

		{/* Charger plus de posts */}
		<section className="LoadMore_section">
		  {loading && visiblePosts.length > 0 ? (
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

	  {/* Ajouter un post */}
	  <section className="AddPost_section">
		<AddPost />
	  </section>

	  {/* Bouton scroll-top */}
	  <Button
		className={`scroll-top-button ${showScrollTop ? 'visible' : ''}`}
		onClick={scrollToTop}
		aria-label="Retour en haut"
	  >
		<i className="pi pi-angle-up" style={{ fontSize: '1.5rem' }}></i>
	  </Button>
	</div>
  );
};

export default Posts;
