import React, { useState } from 'react';
import './Account.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import AccountRecettes from '@pages/AccountRecettes/AccountRecettes';
import AccountDetail from '@pages/AccountDetail/AccountDetail';
import AccountRecetteFavoris from '@pages/AccountRecetteFavoris/AccountRecetteFavoris';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { confirmDialog } from 'primereact/confirmdialog';

const Account: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [, setActiveLink] = useState(window.location.pathname);

  const navigationItems = [
    {
      to: '/account',
      label: 'Mon Profil',
      icon: 'pi pi-user'
    },
    {
      to: '/account/mes-recettes',
      label: 'Mes Recettes',
      icon: 'pi pi-book'
    },
    {
      to: '/account/mes-favoris',
      label: 'Mes Favoris',
      icon: 'pi pi-heart'
    }
  ];

  const handleLogout = () => {
    confirmDialog({
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      header: 'Confirmation de déconnexion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: async () => {
        await logout();
        navigate('/');
      }
    });
  };

  if (!user) {
    return (
      <div className="account-loading">
        <h2>Vous n'êtes pas connecté</h2>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <Card className="panel-left">
          <div className="user-profile">
            {user.photoURL ? (
              <Avatar image={user.photoURL} size="xlarge" shape="circle" />
            ) : (
              <Avatar
                label={user.displayName?.charAt(0) || "U"}
                size="xlarge"
                shape="circle"
                style={{ backgroundColor: 'var(--primary-color)' }}
              />
            )}
            <h2>{user.displayName || "Utilisateur"}</h2>
            <p className="user-email">{user.email}</p>
            <Button
              label="Déconnexion"
              icon="pi pi-sign-out"
              severity="danger"
              text
              onClick={handleLogout}
              className="logout-button"
            />
          </div>

          <nav className="account-navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/account'}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setActiveLink(item.to)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </Card>

        <Card className="panel-right">
          <Routes>
            <Route path="*" element={<AccountDetail />} />
            <Route path="mes-recettes" element={<AccountRecettes />} />
            <Route path="mes-favoris" element={<AccountRecetteFavoris />} />
          </Routes>
        </Card>
      </div>
    </div>
  );
};

export default Account;
