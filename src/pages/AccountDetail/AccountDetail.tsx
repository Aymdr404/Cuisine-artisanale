import React from 'react';
import './AccountDetail.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { Button } from 'primereact/button';


const AccountDetail: React.FC = () => {

  const { user, logout } = useAuth();

  return (
    <div className="AccountDetail">
      <h2>Bienvenue {user?.displayName}</h2>
      <p>Vous pouvez modifier vos informations personnelles ici</p>
      <Button 
        className="logout-button" 
        onClick={logout}
        style={{ 
          display: 'block',
          margin: '20px auto'
        }}
      >
        Logout
      </Button>

    </div>
  );
};

export default AccountDetail;
