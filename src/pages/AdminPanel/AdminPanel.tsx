import React from 'react';
import './AdminPanel.css';

import Sidebar from '@/components/SideBarAdminPanel/SideBarAdminPanel';
import PostsAdmin from '@pages/PostsAdmin/PostsAdmin';
import RecettesAdmin from '@pages/RecettesAdmin/RecettesAdmin';
import Dashboard from '@pages/Dashboard/Dashboard';
import Users from '@pages/Users/Users';
import IngredientsAdmin from '@pages/IngredientsAdmin/IngredientsAdmin';

import { Route, Routes } from 'react-router-dom';


const AdminPanel: React.FC = () => {
  return (
    <div className="AdminPanel">
      <Sidebar />
      <div className="admin-content">
        <Routes>
          <Route path="*" element={<Dashboard/>} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<PostsAdmin />} />
          <Route path="recettes" element={<RecettesAdmin />} />
          <Route path="ingredients" element={<IngredientsAdmin/>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
