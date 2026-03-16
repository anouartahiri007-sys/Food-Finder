import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Utensils, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from './api/axios';
// ... rest of imports

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
import NotFound from './pages/NotFound';
import AdminLogin from './components/Auth/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import MenuPage from './pages/MenuPage';
import RestaurantProfile from './pages/RestaurantProfile';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/profile');
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
      <div className={`app-container ${theme}-mode`} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
        <header>
          <Link to="/" className="brand">
            <Utensils size={28} />
            Food Finder
          </Link>
          <nav className="nav-links">
            {/* Language Switcher */}
            <div className="language-switcher" style={{ display: 'flex', gap: '0.4rem', marginRight: '1rem', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
              <button 
                onClick={() => changeLanguage('fr')} 
                className={`btn-icon ${currentLanguage === 'fr' ? 'active' : ''}`}
                style={{ fontSize: '0.7rem', fontWeight: currentLanguage === 'fr' ? '800' : '400', padding: '4px' }}
              >
                FR
              </button>
              <button 
                onClick={() => changeLanguage('en')} 
                className={`btn-icon ${currentLanguage === 'en' ? 'active' : ''}`}
                style={{ fontSize: '0.7rem', fontWeight: currentLanguage === 'en' ? '800' : '400', padding: '4px' }}
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage('ar')} 
                className={`btn-icon ${currentLanguage === 'ar' ? 'active' : ''}`}
                style={{ fontSize: '0.7rem', fontWeight: currentLanguage === 'ar' ? '800' : '400', padding: '4px' }}
              >
                AR
              </button>
            </div>

            <button onClick={toggleTheme} className="btn-icon">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/" className="nav-item">{t('nav.home')}</Link>
            {user ? (
              <>
                {user.role === 'owner' && (
                  <Link to="/dashboard" className="nav-item">{t('nav.dashboard')}</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="nav-item" style={{ color: 'var(--danger)', fontWeight: '700' }}>SaaS Admin</Link>
                )}
                <Link to="/profile" className="nav-item">{t('nav.profile')}</Link>
                <button onClick={handleLogout} className="btn btn-secondary">{t('nav.logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">{t('nav.login')}</Link>
                <Link to="/register" className="btn btn-primary">{t('nav.register')}</Link>
              </>
            )}
          </nav>
        </header>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === "dark" ? "dark" : "light"}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/restaurants/:id/menu" element={<MenuPage />} />
            <Route path="/dashboard" element={user?.role === 'owner' ? <RestaurateurDashboard /> : <Home />} />
            <Route path="/admin/dashboard" element={user?.role === 'admin' ? <AdminDashboard /> : <AdminLogin />} />
            <Route path="/profile" element={user?.role === 'owner' ? <RestaurantProfile /> : <Profile />} />
            <Route path="/add-restaurant" element={user?.role === 'owner' ? <AddRestaurant /> : <Home />} />
            <Route path="/restaurants/:id/edit" element={<EditRestaurant />} />

            {/* Legal and Info Routes */}
            <Route path="/about" element={<StaticPage />} />
            <Route path="/contact" element={<StaticPage />} />
            <Route path="/help" element={<StaticPage />} />
            <Route path="/terms" element={<StaticPage />} />
            <Route path="/privacy" element={<StaticPage />} />
            <Route path="/rgpd" element={<StaticPage />} />
            <Route path="/cookies" element={<StaticPage />} />

            {/* Catch-all Route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

