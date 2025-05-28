import React, { useContext, useEffect, useState, useRef } from 'react';
import './Navbar.css';

import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ThemeContext } from '@/contexts/ThemeContext/ThemeContext';
import ButtonLinkNav from '@components/ButtonLinkNav/ButtonLinkNav';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout, signInWithGoogle, role } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const overlayPanelRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Hide navbar when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsNavbarVisible(false);
        } else {
          setIsNavbarVisible(true);
        }
      }

      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleProfileClick = () => {
    overlayPanelRef.current?.hide();
    navigate('/account');
  };

  const handleMyRecipesClick = () => {
    overlayPanelRef.current?.hide();
    navigate('/account/mes-recettes');
  };

  const handleAdminClick = () => {
    overlayPanelRef.current?.hide();
    navigate('/admin-panel');
  };

  const handleLogout = async () => {
    try {
      overlayPanelRef.current?.hide();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const menuItems = [
    { label: 'Mon Profil', icon: 'pi pi-user', onClick: handleProfileClick },
    { label: 'Mes Recettes', icon: 'pi pi-book', onClick: handleMyRecipesClick },
    ...(role === 'admin' ? [
      { label: 'Administration', icon: 'pi pi-cog', onClick: handleAdminClick }
    ] : []),
    { type: 'separator' },
    { label: 'Déconnexion', icon: 'pi pi-power-off', onClick: handleLogout }
  ];

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // No need to navigate, AuthContext will handle the state change
    } catch (error) {
      console.error('Login error:', error);
      // You might want to show a toast message here
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Accueil';
      case '/recettes':
        return 'Recettes';
      case '/carte':
        return 'Carte des Recettes';
      default:
        return '';
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${!isNavbarVisible ? 'navbar-hidden' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1 className="site-title">Cuisine Artisanale</h1>
            <span className="page-title">{getPageTitle()}</span>
          </div>

          <div className="navbar-navigation">
            <ButtonLinkNav />
          </div>

          <div className="navbar-actions">
            <Button 
              icon={theme === "dark" ? "pi pi-sun" : "pi pi-moon"}
              className="theme-toggle"
              onClick={toggleTheme}
              tooltip={theme === "dark" ? "Mode clair" : "Mode sombre"}
              tooltipOptions={{ position: 'bottom' }}
            />

            {user ? (
              <div className="user-menu">
                <Button
                  className="user-menu-trigger"
                  onClick={(e) => overlayPanelRef.current?.toggle(e)}
                >
                  {user.photoURL ? (
                    <Avatar image={user.photoURL} shape="circle" />
                  ) : (
                    <Avatar 
                      label={user.displayName?.charAt(0) || "U"} 
                      shape="circle"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    />
                  )}
                  <span className="user-name">{user.displayName || "Utilisateur"}</span>
                  {role === 'admin' && (
                    <span className="user-role">Admin</span>
                  )}
                  <i className="pi pi-chevron-down" />
                </Button>
                <OverlayPanel 
                  ref={overlayPanelRef}
                  className="user-menu-panel"
                  showCloseIcon={false}
                  dismissable
                >
                  <div className="user-menu-content">
                    {menuItems.map((item, index) => (
                      item.type === 'separator' ? (
                        <div key={index} className="menu-separator" />
                      ) : (
                        <Button
                          key={index}
                          className="menu-item"
                          onClick={item.onClick}
                        >
                          <i className={item.icon} />
                          <span>{item.label}</span>
                        </Button>
                      )
                    ))}
                  </div>
                </OverlayPanel>
              </div>
            ) : (
              <div className="auth-buttons">
                <Button 
                  label="Se connecter avec Google" 
                  icon="pi pi-google"
                  className="p-button-outlined google-auth-btn"
                  onClick={handleLogin}
                  loading={isLoading}
                />
              </div>
            )}

            <Button
              icon={isMobileMenuOpen ? "pi pi-times" : "pi pi-bars"}
              className="mobile-menu-toggle"
              onClick={handleMobileMenuToggle}
              aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            />
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'show' : ''}`}>
        <div className="mobile-menu-content">
          <ButtonLinkNav isMobile onClick={handleMobileMenuClose} />
          {user ? (
            <div className="mobile-user-menu">
              {menuItems.map((item, index) => (
                item.type === 'separator' ? (
                  <div key={index} className="menu-separator" />
                ) : (
                  <Button
                    key={index}
                    className="menu-item"
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                        handleMobileMenuClose();
                      }
                    }}
                  >
                    <i className={item.icon} />
                    <span>{item.label}</span>
                  </Button>
                )
              ))}
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Button 
                label="Se connecter avec Google" 
                icon="pi pi-google"
                className="p-button-outlined google-auth-btn"
                onClick={handleLogin}
                loading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
