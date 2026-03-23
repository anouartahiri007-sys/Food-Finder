import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Utensils, Globe, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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

// Language flags
const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { t, i18n } = useTranslation();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const langDropdownRef = useRef(null);

  const currentLanguage = i18n.language;
  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && languages.some(l => l.code === savedLang)) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setHeaderVisible(false);
      } else {
        // Scrolling up - show header
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLangDropdown(false);
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
        <header className={headerVisible ? 'header-visible' : 'header-hidden'}>
          <Link to="/" className="brand">
            <Utensils size={28} />
            Food Finder
          </Link>
          <nav className="nav-links">
            {/* Language Switcher with Dropdown */}
            <div className="language-switcher" ref={langDropdownRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="btn-icon language-btn"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: '6px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  minWidth: '40px',
                  justifyContent: 'center'
                }}
                title="Changer de langue"
              >
                <Globe size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
              
              {showLangDropdown && (
                <div className="language-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  zIndex: 1000,
                  minWidth: '180px'
                }}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        width: '100%',
                        padding: '0.6rem 1rem',
                        border: 'none',
                        background: currentLanguage === lang.code ? 'var(--primary)' : 'transparent',
                        color: currentLanguage === lang.code ? 'white' : 'var(--text-main)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (currentLanguage !== lang.code) {
                          e.currentTarget.style.background = 'var(--border-color)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentLanguage !== lang.code) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                      <span style={{ fontWeight: currentLanguage === lang.code ? '600' : '400' }}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleTheme} className="btn-icon" title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}>
              <span style={{ 
                fontSize: '1.3rem',
                filter: theme === 'light' ? 'brightness(0.7)' : 'brightness(1)',
                transition: 'all 0.2s ease'
              }}>
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
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
                {user.role !== 'admin' && (
                  <Link to="/profile" className="nav-item">{t('nav.profile')}</Link>
                )}
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
