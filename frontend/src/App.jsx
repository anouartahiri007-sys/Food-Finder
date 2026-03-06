import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from './api/axios';

import Home from './pages/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import RestaurantDetail from './pages/RestaurantDetail';
import RestaurateurDashboard from './pages/RestaurateurDashboard';
import Profile from './pages/Profile';
import AddRestaurant from './pages/AddRestaurant';
import EditRestaurant from './pages/EditRestaurant';
import StaticPage from './pages/StaticPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/user');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth error', error);
        localStorage.removeItem('token');
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  return (
    <Router>
      <div className={`app-container ${theme}-mode`}>
        <header>
          <Link to="/" className="brand">
            <Utensils size={28} />
            Food Finder
          </Link>
          <nav className="nav-links">
            <button onClick={toggleTheme} className="btn-icon">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/" className="nav-item">Accueil</Link>
            {user ? (
              <>
                {user.role === 'owner' && (
                  <Link to="/dashboard" className="nav-item">Tableau de bord</Link>
                )}
                <Link to="/profile" className="nav-item">Profil</Link>
                <button onClick={handleLogout} className="btn btn-secondary">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Connexion</Link>
                <Link to="/register" className="btn btn-primary">Inscription</Link>
              </>
            )}
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/dashboard" element={<RestaurateurDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add-restaurant" element={<AddRestaurant />} />
            <Route path="/restaurants/:id/edit" element={<EditRestaurant />} />

            {/* Legal and Info Routes */}
            <Route path="/about" element={<StaticPage />} />
            <Route path="/contact" element={<StaticPage />} />
            <Route path="/help" element={<StaticPage />} />
            <Route path="/terms" element={<StaticPage />} />
            <Route path="/privacy" element={<StaticPage />} />
            <Route path="/rgpd" element={<StaticPage />} />
          </Routes>
        </main>

        <footer className="footer-saas">
          <div className="footer-content">

            {/* Brand section */}
            <div className="footer-brand-section">
              <h3 className="footer-logo">Food Finder</h3>
              <p>
                Découvrez les meilleurs restaurants adaptés à vos préférences alimentaires.
              </p>
            </div>

            {/* Links */}
            <div className="footer-links-grid">

              <div className="footer-column">
                <h4>Liens rapides</h4>
                <Link to="/about">À propos</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/help">Aide</Link>
              </div>

              {user?.role === 'owner' && (
                <div className="footer-column">
                  <h4>Restaurateurs</h4>
                  <Link to="/add-restaurant">Ajouter un restaurant</Link>
                  <Link to="/dashboard">Tableau de bord</Link>
                </div>
              )}

              <div className="footer-column">
                <h4>Légal</h4>
                <Link to="/terms">Conditions d'utilisation</Link>
                <Link to="/privacy">Confidentialité</Link>
                <Link to="/rgpd">RGPD</Link>
              </div>

            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Food Finder. Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
