import React from 'react';
import './Home.css';

import Actualites from '../Actualites/Actualites';
import Posts from '../Posts/Posts';


const Home: React.FC = () => {
  return (
    <div className="Home">
      <Actualites />
      <Posts />
    </div>
  );
};

export default Home;
