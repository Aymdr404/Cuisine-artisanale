"use client";
import React, { useState, useEffect } from 'react';
import './AccountDetail.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations/PersonalizedRecommendations';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@firebaseModule';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { Chart } from 'primereact/chart';
import { Timeline } from 'primereact/timeline';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

interface UserStats {
  recipesCount: number;
  totalLikes: number;
  averageRating: number;
  totalReviews: number;
  favoriteRecipesCount: number;
  postsCount: number;
}

interface RecentActivity {
  id: string;
  type: 'recipe' | 'post' | 'like' | 'review';
  title: string;
  date: Date;
  description: string;
}

const AccountDetail: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const toast = useRef<Toast>(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
	if (user) {
	  fetchUserStats();
	  fetchRecentActivity();
	}
  }, [user]);

  const fetchUserStats = async () => {
	if (!user) return;

	try {
	  const recipesCollection = collection(db, 'recipes');
	  const likesCollection = collection(db, 'likes');
	  const reviewsCollection = collection(db, 'reviews');
	  const postsCollection = collection(db, 'posts');

	  // Fetch recipes count
	  const recipesQuery = query(recipesCollection, where('createdBy', '==', user.uid));
	  const recipesSnapshot = await getDocs(recipesQuery);
	  const recipesCount = recipesSnapshot.size;

	  // Fetch total likes received
	  const recipeIds = recipesSnapshot.docs.map(doc => doc.id);
	  let totalLikes = 0;
	  if (recipeIds.length > 0) {
		for (let i = 0; i < recipeIds.length; i += 10) {
		  const chunk = recipeIds.slice(i, i + 10);
		  const likesQuery = query(likesCollection, where('recetteId', 'in', chunk));
		  const likesSnapshot = await getDocs(likesQuery);
		  totalLikes += likesSnapshot.size;
		}
	  }

	  // Fetch reviews and calculate average rating
	  const reviewsQuery = query(reviewsCollection, where('recipeId', 'in', recipeIds.length > 0 ? recipeIds.slice(0, 10) : ['']));
	  const reviewsSnapshot = await getDocs(reviewsQuery);
	  let totalRating = 0;
	  reviewsSnapshot.docs.forEach(doc => {
		totalRating += doc.data().rating || 0;
	  });
	  const averageRating = reviewsSnapshot.size > 0 ? (totalRating / reviewsSnapshot.size).toFixed(1) : 0;
	  const totalReviews = reviewsSnapshot.size;

	  // Fetch user's favorite recipes
	  const userRef = doc(db, 'users', user.uid);
	  const userSnap = await getDoc(userRef);
	  const favoriteRecipesCount = userSnap.data()?.likedRecipes?.length || 0;

	  // Fetch user's posts count
	  const postsQuery = query(postsCollection, where('userId', '==', user.uid));
	  const postsSnapshot = await getDocs(postsQuery);
	  const postsCount = postsSnapshot.size;

	  setStats({
		recipesCount,
		totalLikes,
		averageRating: parseFloat(String(averageRating)),
		totalReviews,
		favoriteRecipesCount,
		postsCount
	  });
	} catch (error) {
	  console.error('Error fetching stats:', error);
	} finally {
	  setLoading(false);
	}
  };

  const fetchRecentActivity = async () => {
	if (!user) return;

	try {
	  const recipesCollection = collection(db, 'recipes');
	  const postsCollection = collection(db, 'posts');

	  const activities: RecentActivity[] = [];

	  // Fetch recent recipes
	  const recipesQuery = query(
		recipesCollection,
		where('createdBy', '==', user.uid)
	  );
	  const recipesSnapshot = await getDocs(recipesQuery);
	  recipesSnapshot.docs.slice(0, 3).forEach(doc => {
		const data = doc.data();
		activities.push({
		  id: doc.id,
		  type: 'recipe',
		  title: data.title,
		  date: data.createdAt?.toDate() || new Date(),
		  description: `Recette créée - ${data.type}`
		});
	  });

	  // Fetch recent posts
	  const postsQuery = query(
		postsCollection,
		where('userId', '==', user.uid)
	  );
	  const postsSnapshot = await getDocs(postsQuery);
	  postsSnapshot.docs.slice(0, 2).forEach(doc => {
		const data = doc.data();
		activities.push({
		  id: doc.id,
		  type: 'post',
		  title: data.title,
		  date: data.createdAt?.toDate() || new Date(),
		  description: 'Publication créée'
		});
	  });

	  // Sort by date (newest first) and keep only 5
	  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
	  setRecentActivity(activities.slice(0, 5));
	} catch (error) {
	  console.error('Error fetching activity:', error);
	}
  };

  const handleSaveProfile = async () => {
	// Profile editing would be implemented here
	// For now, just show a toast
	if (toast.current) {
	  toast.current.show({ severity: 'info', summary: 'Profil', detail: 'Fonctionnalité de modification du profil à venir', life: 3000 });
	}
	setEditDialogVisible(false);
  };

  const activityTemplate = (activity: RecentActivity) => {
	const iconClass = activity.type === 'recipe' ? 'pi pi-book' : 'pi pi-comment';
	return (
	  <div className="activity-item">
		<i className={iconClass}></i>
		<div className="activity-content">
		  <strong>{activity.title}</strong>
		  <p>{activity.description}</p>
		  <small>{activity.date.toLocaleDateString()}</small>
		</div>
	  </div>
	);
  };

  if (!user) {
	return (
	  <div className="AccountDetail">
		<h2>Vous n'êtes pas connecté</h2>
	  </div>
	);
  }

  return (
	<div className="AccountDetail">
	  <Toast ref={toast} />

	  {/* Header with greeting and edit profile button */}
	  <div className="dashboard-header">
		<div className="welcome-section">
		  <h2>Bienvenue, {user?.displayName}! 👋</h2>
		  <p>Voici un aperçu de votre profil et de votre activité</p>
		</div>
		<Button
		  icon="pi pi-pencil"
		  label="Éditer le profil"
		  onClick={() => setEditDialogVisible(true)}
		  className="edit-profile-btn"
		/>
	  </div>

	  {/* Statistics Cards */}
	  <div className="stats-grid">
		<Card className="stat-card">
		  <div className="stat-content">
			<i className="pi pi-book stat-icon"></i>
			<div className="stat-info">
			  {loading ? (
				<Skeleton height="2rem" width="100px" />
			  ) : (
				<>
				  <h3>{stats?.recipesCount || 0}</h3>
				  <p>Recettes créées</p>
				</>
			  )}
			</div>
		  </div>
		</Card>

		<Card className="stat-card">
		  <div className="stat-content">
			<i className="pi pi-heart stat-icon"></i>
			<div className="stat-info">
			  {loading ? (
				<Skeleton height="2rem" width="100px" />
			  ) : (
				<>
				  <h3>{stats?.totalLikes || 0}</h3>
				  <p>J'aime reçus</p>
				</>
			  )}
			</div>
		  </div>
		</Card>

		<Card className="stat-card">
		  <div className="stat-content">
			<i className="pi pi-star stat-icon"></i>
			<div className="stat-info">
			  {loading ? (
				<Skeleton height="2rem" width="100px" />
			  ) : (
				<>
				  <h3>{stats?.averageRating?.toFixed(1) || 'N/A'}/5</h3>
				  <p>Note moyenne</p>
				</>
			  )}
			</div>
		  </div>
		</Card>

		<Card className="stat-card">
		  <div className="stat-content">
			<i className="pi pi-comments stat-icon"></i>
			<div className="stat-info">
			  {loading ? (
				<Skeleton height="2rem" width="100px" />
			  ) : (
				<>
				  <h3>{stats?.totalReviews || 0}</h3>
				  <p>Avis reçus</p>
				</>
			  )}
			</div>
		  </div>
		</Card>

		<Card className="stat-card">
		  <div className="stat-content">
			<i className="pi pi-bookmark stat-icon"></i>
			<div className="stat-info">
			  {loading ? (
				<Skeleton height="2rem" width="100px" />
			  ) : (
				<>
				  <h3>{stats?.favoriteRecipesCount || 0}</h3>
				  <p>Recettes favorites</p>
				</>
			  )}
			</div>
		  </div>
		</Card>

		<Card className="stat-card">
		  <div className="stat-content">
			<i className="pi pi-comment stat-icon"></i>
			<div className="stat-info">
			  {loading ? (
				<Skeleton height="2rem" width="100px" />
			  ) : (
				<>
				  <h3>{stats?.postsCount || 0}</h3>
				  <p>Publications</p>
				</>
			  )}
			</div>
		  </div>
		</Card>
	  </div>

	  {/* Recent Activity Section */}
	  {recentActivity.length > 0 && (
		<Card className="activity-card">
		  <h3 className="activity-title">Activité Récente</h3>
		  <Timeline
			value={recentActivity}
			content={(activity) => activityTemplate(activity)}
			opposite={(activity) => (
			  <small className="p-text-secondary">{activity.date.toLocaleDateString('fr-FR')}</small>
			)}
			layout="horizontal"
			align="top"
			className="custom-timeline"
		  />
		</Card>
	  )}

	  {/* Personalized Recommendations */}
	  <Card className="recommendations-card">
		<h3 className="recommendations-title">Recommandations Personnalisées</h3>
		<PersonalizedRecommendations />
	  </Card>

	  {/* Edit Profile Dialog */}
	  <Dialog
		visible={editDialogVisible}
		onHide={() => setEditDialogVisible(false)}
		header="Éditer le profil"
		modal
		style={{ width: '50vw' }}
		className='dialog-account'
	  >
		<div className="edit-form">
		  <div className="form-group">
			<label htmlFor="displayName">Nom d'affichage</label>
			<InputText
			  id="displayName"
			  value={displayName}
			  onChange={(e) => setDisplayName(e.target.value)}
			  placeholder="Votre nom"
			/>
		  </div>
		  <div className="form-group">
			<label htmlFor="email">Email</label>
			<InputText
			  id="email"
			  value={user?.email || ''}
			  disabled
			  placeholder="Email"
			/>
		  </div>
		  <div className="dialog-buttons">
			<Button
			  label="Annuler"
			  icon="pi pi-times"
			  onClick={() => setEditDialogVisible(false)}
			  className="p-button-secondary"
			/>
			<Button
			  label="Enregistrer"
			  icon="pi pi-check"
			  onClick={handleSaveProfile}
			/>
		  </div>
		</div>
	  </Dialog>
	</div>
  );
};

export default AccountDetail;
