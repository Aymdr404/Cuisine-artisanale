import React, { Suspense } from 'react';
import './Home.css';

import Actualites from '../Actualites/Actualites';
const Posts = React.lazy(() => import('../Posts/Posts'));


const Home: React.FC = () => {
  return (
	<div className="Home">
	  <Actualites />
	  <Suspense fallback={<div className="posts-skeleton">Chargement des posts...</div>}>
		<Posts />
	  </Suspense>
	</div>
  );
};

export default Home;
