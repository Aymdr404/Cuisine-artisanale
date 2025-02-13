import React from 'react';
import './AdminPanel.css';

import Sidebar from '@/components/SideBarAdminPanel/SideBarAdminPanel';
import PostsAdmin from '@pages/PostsAdmin/PostsAdmin';
import RecettesAdmin from '@pages/RecettesAdmin/RecettesAdmin';
import Dashboard from '@pages/Dashboard/Dashboard';

import { Route, Routes } from 'react-router-dom';
import Users from '../Users/Users';



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
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;
