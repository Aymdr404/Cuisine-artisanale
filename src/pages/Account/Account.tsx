import React from 'react';
import './Account.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';

const Account: React.FC = () => {

  const { user, logout } = useAuth();
  

  return (
    <div className="Account">
      {user ? (
        <div>
          <h1>Welcome, {user.displayName || "User"}!</h1>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <h1>Not logged in</h1>
      )}
    </div>
  );
};

export default Account;
