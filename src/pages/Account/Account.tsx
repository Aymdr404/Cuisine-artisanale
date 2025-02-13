import React from 'react';
import './Account.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { NavLink, Route, Routes } from 'react-router-dom';
import AccountRecettes from '@pages/AccountRecettes/AccountRecettes';
import AccountDetail from '@pages/AccountDetail/AccountDetail';
import AccountRecetteFavoris from '@pages/AccountRecetteFavoris/AccountRecetteFavoris';

const Account: React.FC = () => {

  const { user, logout } = useAuth();
  

  return (
    <div className="Account">
      {user ? (
        <div className='account-container'>
          <section className="panel-left">
            <div className='info-user'>
              <h3>Welcome, {user.displayName ?? "User"}!</h3>
              <button onClick={logout}>Logout</button>
            </div>
            <section className="navigation-bar">
              <nav>
                <ul>
                  <li>
                    <NavLink to="/account">Mon compte</NavLink>
                  </li>
                  <li>
                    <NavLink to="/account/mes-recettes">Mes recettes</NavLink>
                  </li>
                  <li>
                    <NavLink to="/account/mes-favoris">Mes favoris</NavLink>
                  </li>
                </ul>
              </nav>
            </section>
          </section>
          <section className="panel-right">
            <Routes>
              <Route path="*" element={<AccountDetail/> } />
              <Route path="mes-recettes" element={<AccountRecettes/>} />
              <Route path="mes-favoris" element={<AccountRecetteFavoris/>} />
            </Routes>
          </section>
        </div>
      ) : (
        <h1>Chargement ...</h1>
      )}
    </div>
  );
};

export default Account;
