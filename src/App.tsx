// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext/ThemeContext';
import './contexts/ThemeContext/ThemeContext.css';
import './styles/theme.css';
import './styles/admin.css';
import './styles/dialog.css';
import { useEffect } from 'react';
import { ToastProvider } from './contexts/ToastContext/ToastContext';

import Navbar from '@components/Navbar/Navbar';
import Home from '@pages/Home/Home';
import Recipes from '@pages/Recettes/Recettes';
import About from '@pages/About/About';
import { AuthProvider } from '@/contexts/AuthContext/AuthContext';
import AddRecetteForm from './components/AddRecetteForm/AddRecetteForm';
import RecetteDesc from './components/RecetteDesc/RecetteDesc';
import RecetteMap from '@pages/RecetteMap/RecetteMap';
import Account from '@pages/Account/Account';
import ProtectedRoute from '@components/ProtectedRoute/ProtectedRoute';
import AdminPanel from '@pages/AdminPanel/AdminPanel';
import EditRecette from '@pages/EditRecette/EditRecette';
import LegalMention from '@components/LegalMention/LegalMention';
import { ToastContainer } from 'react-toastify';

const App = () => {
  useEffect(() => {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router basename='/Cuisine-artisanale'>
            <Navbar />
            <div className="wrapper">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/recettes" element={<Recipes />} />
                <Route path="/about" element={<About />} />
                <Route path="/recettes/add-recipe" element={<AddRecetteForm />} />
                <Route path="/recettes/:recipeName" element={<RecetteDesc />} />
                <Route path="/recettes/:id/edit" element={<EditRecette />} />
                <Route path="/map" element={<RecetteMap />} />
                <Route path="/account/*" element={<Account />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/admin-panel/*" element={<AdminPanel />} />
                </Route>

                <Route path="*" element={<h1>404 - Not Found</h1>} />
              </Routes>
            </div>
            <LegalMention />
          </Router>
          <ToastContainer />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};


export default App;
