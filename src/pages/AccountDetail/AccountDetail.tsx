import React from 'react';
import './AccountDetail.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';


const AccountDetail: React.FC = () => {

  const { user } = useAuth();

  return (
    <div className="AccountDetail">
      <h2>Bienvenue {user?.displayName}</h2>
      <p>Vous pouvez modifier vos informations personnelles ici</p>

    </div>
  );
};

export default AccountDetail;
