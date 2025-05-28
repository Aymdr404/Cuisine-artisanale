import React, { useEffect } from 'react';
import './AdminPanel.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/SideBarAdminPanel/SideBarAdminPanel';
import PostsAdmin from '@pages/PostsAdmin/PostsAdmin';
import RecettesAdmin from '@pages/RecettesAdmin/RecettesAdmin';
import Dashboard from '@pages/Dashboard/Dashboard';
import Users from '@pages/Users/Users';
import IngredientsAdmin from '@pages/IngredientsAdmin/IngredientsAdmin';
import UnitsAdmin from '@pages/UnitsAdmin/UnitsAdmin';
import { Route, Routes } from 'react-router-dom';
import { Card } from 'primereact/card';
import { BreadCrumb } from 'primereact/breadcrumb';
import { useLocation } from 'react-router-dom';
import { Message } from 'primereact/message';

const AdminPanel: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect non-admin users
    if (role !== 'admin') {
      navigate('/');
    }
  }, [role, navigate]);

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const path = location.pathname.split('/').filter(Boolean);
    return [
      { label: 'Administration', url: '/admin-panel' },
      ...path.slice(1).map((item) => ({
        label: item.charAt(0).toUpperCase() + item.slice(1),
        url: `/admin-panel/${item}`
      }))
    ];
  };

  const home = { icon: 'pi pi-home', url: '/' };

  if (role !== 'admin') {
    return (
      <div className="access-denied">
        <Message 
          severity="error" 
          text="Accès refusé. Cette page est réservée aux administrateurs." 
        />
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <Sidebar />
      
      <div className="admin-main">
        <div className="admin-header">
          <BreadCrumb 
            model={getBreadcrumbItems()} 
            home={home}
            className="admin-breadcrumb"
          />
          
          <div className="admin-user-info">
            <span className="welcome-text">
              Bienvenue, {user?.displayName || 'Administrateur'}
            </span>
          </div>
        </div>

        <Card className="admin-content">
          <Routes>
            <Route path="*" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="posts" element={<PostsAdmin />} />
            <Route path="recettes" element={<RecettesAdmin />} />
            <Route path="ingredients" element={<IngredientsAdmin />} />
            <Route path="units" element={<UnitsAdmin />} />
          </Routes>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
