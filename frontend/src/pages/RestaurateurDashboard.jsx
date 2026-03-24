import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin, Users, Calendar, Star, Check, X, Clock, Store, Image, Save, ArrowLeft, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const RestaurateurDashboard = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [restaurantMenus, setRestaurantMenus] = useState([]);
    const [restaurantWorkingHours, setRestaurantWorkingHours] = useState([]);
    const [restaurantPhotos, setRestaurantPhotos] = useState([]);
    const [loadingMenuData, setLoadingMenuData] = useState(false);
    const [savingHours, setSavingHours] = useState(false);

    // Form states
    const [hoursForm, setHoursForm] = useState({});
    const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '' });
    const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', category: '' });
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    
    // UI states
    const [expandedMenus, setExpandedMenus] = useState({});
    const [showRestaurantSelector, setShowRestaurantSelector] = useState(false);

    const [backendStats, setBackendStats] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const userRes = await api.get('/profile');
                setUser(userRes.data);

                const resRes = await api.get('/owner/restaurants');
                setRestaurants(resRes.data);

                const reservationsRes = await api.get('/owner/reservations');
                setReservations(reservationsRes.data);

                const statsRes = await api.get('/owner/stats');
                setBackendStats(statsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [navigate]);

    // Fetch menu/photos/hours when switching tabs
    useEffect(() => {
        if (selectedRestaurant && ['schedules', 'menus', 'photos'].includes(activeTab)) {
            fetchRestaurantData(selectedRestaurant.id);
        }
    }, [activeTab, selectedRestaurant]);

    const fetchRestaurantData = async (restaurantId) => {
        setLoadingMenuData(true);
        try {
            const [menusRes, hoursRes, photosRes] = await Promise.all([
                api.get(`/restaurants/${restaurantId}/menus`),
                api.get(`/restaurants/${restaurantId}/working-hours`),
                api.get(`/restaurants/${restaurantId}`)
            ]);
            setRestaurantMenus(menusRes.data);
            setRestaurantWorkingHours(hoursRes.data);
            setRestaurantPhotos(photosRes.data.photos || []);
            
            // Initialize hours form
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const form = {};
            days.forEach(day => {
                const existing = hoursRes.data.find(h => h.day === day);
                form[day] = existing ? {
                    open_time: existing.open_time || '',
                    close_time: existing.close_time || '',
                    is_closed: existing.is_closed || false
                } : { open_time: '', close_time: '', is_closed: false };
            });
            setHoursForm(form);
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
        } finally {
            setLoadingMenuData(false);
        }
    };

    const handleSelectRestaurant = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setActiveTab('schedules');
        setShowRestaurantSelector(false);
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/reservations/${id}/status`, { status });
            setReservations(prev => prev.map(res =>
                res.id === id ? { ...res, status } : res
            ));
            toast.success(`Réservation ${status === 'confirmed' ? 'confirmée' : 'annulée'} avec succès`);
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    const handleDeleteRestaurant = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce restaurant ? Cette action est irréversible.')) {
            try {
                await api.delete(`/restaurants/${id}`);
                setRestaurants(restaurants.filter(r => r.id !== id));
                toast.success('Restaurant supprimé définitivement');
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleSaveHours = async () => {
        if (!selectedRestaurant) return;
        setSavingHours(true);
        try {
            const workingHours = Object.entries(hoursForm).map(([day, data]) => ({
                day,
                open_time: data.open_time,
                close_time: data.close_time,
                is_closed: data.is_closed
            }));
            await api.post(`/restaurants/${selectedRestaurant.id}/working-hours`, { working_hours: workingHours });
            toast.success('✅ Horaires enregistrés avec succès !');
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('❌ Erreur lors de l\'enregistrement des horaires');
        } finally {
            setSavingHours(false);
        }
    };

    const handleCreateMenu = async () => {
        if (!selectedRestaurant || !menuForm.name.trim()) {
            toast.warning('⚠️ Veuillez entrer un nom de menu');
            return;
        }
        try {
            await api.post(`/restaurants/${selectedRestaurant.id}/menus`, menuForm);
            toast.success('✅ Menu créé avec succès !');
            setMenuForm({ name: '', description: '', price: '' });
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('❌ Erreur lors de la création du menu');
        }
    };

    const handleAddMenuItem = async () => {
        if (!selectedMenu || !itemForm.name.trim() || !itemForm.price) {
            toast.warning('⚠️ Veuillez remplir le nom et le prix');
            return;
        }
        try {
            await api.post(`/restaurants/${selectedRestaurant.id}/menu-items`, {
                ...itemForm,
                menu_id: selectedMenu.id,
                price: parseFloat(itemForm.price)
            });
            toast.success('✅ Article ajouté au menu !');
            setItemForm({ name: '', description: '', price: '', category: '' });
            setSelectedMenu(null);
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('❌ Erreur lors de l\'ajout de l\'article');
        }
    };

    const handleAddPhoto = async () => {
        if (!selectedRestaurant || !photoFile) {
            toast.warning('⚠️ Veuillez sélectionner une photo');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('image', photoFile);
            formData.append('restaurant_id', selectedRestaurant.id);
            formData.append('type', 'restaurant');
            await api.post('/photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('✅ Photo ajoutée à la galerie !');
            setPhotoFile(null);
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('❌ Erreur lors de l\'ajout de la photo');
        }
    };

    const handleDeleteMenu = async (menuId) => {
        if (!window.confirm('Voulez-vous supprimer ce menu et tous ses articles ?')) return;
        try {
            await api.delete(`/menus/${menuId}`);
            toast.success('✅ Menu supprimé');
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('❌ Erreur lors de la suppression');
        }
    };

    const handleDeleteMenuItem = async (itemId) => {
        try {
            await api.delete(`/menu-items/${itemId}`);
            toast.success('✅ Article supprimé');
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('❌ Erreur lors de la suppression');
        }
    };

    const handleDeletePhoto = async (photoId) => {
        try {
            await api.delete(`/photos/${photoId}`);
            toast.success('✅ Photo supprimée');
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('❌ Erreur lors de la suppression');
        }
    };

    const toggleMenuExpand = (menuId) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    // Enhanced stats with context
    const stats = [
        { 
            label: 'Total Restaurants', 
            value: backendStats?.restaurants_count || 0, 
            icon: <Store size={24} />, 
            color: '#6366f1',
            context: 'Établissements actifs',
            trend: null
        },
        { 
            label: 'Réservations', 
            value: backendStats?.total_reservations || 0, 
            icon: <Calendar size={24} />, 
            color: '#10b981',
            context: 'Total depuis le début',
            trend: null
        },
        { 
            label: 'Note Moyenne', 
            value: (backendStats?.average_rating || 0).toFixed(1), 
            icon: <Star size={24} />, 
            color: '#f59e0b',
            context: 'Basée sur les avis clients',
            trend: backendStats?.average_rating >= 4 ? 'up' : 'down'
        },
        { 
            label: 'Avis Clients', 
            value: backendStats?.total_reviews || 0, 
            icon: <Users size={24} />, 
            color: '#ec4899',
            context: 'Tous restaurants confondus',
            trend: null
        },
    ];

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = {
        monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
        thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header - Improved Title */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Mon Espace Restaurant
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Bienvenue {user?.name} ! Gérez vos établissements, réservations et menus en un seul endroit.
                </p>
            </div>

            {/* Enhanced Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${stat.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ backgroundColor: stat.color + '15', color: stat.color, padding: '0.75rem', borderRadius: '10px' }}>
                                {stat.icon}
                            </div>
                            {stat.trend && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: stat.trend === 'up' ? '#10b981' : '#ef4444' }}>
                                    {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                </div>
                            )}
                        </div>
                        <h3 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                            {stat.value}
                        </h3>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{stat.label}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{stat.context}</p>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0' }}>
                {[
                    { id: 'overview', label: 'Mes Restaurants', icon: <Store size={18} /> },
                    { id: 'reservations', label: 'Réservations', icon: <Calendar size={18} /> },
                    { id: 'schedules', label: 'Horaires', icon: <Clock size={18} /> },
                    { id: 'menus', label: 'Menus & Cartes', icon: <Star size={18} /> },
                    { id: 'photos', label: 'Galerie Photos', icon: <Image size={18} /> },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        style={{ 
                            padding: '0.75rem 1.25rem', 
                            background: 'none', 
                            border: 'none', 
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', 
                            borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer', 
                            fontWeight: '600', 
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab - Restaurants */}
            {activeTab === 'overview' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Mes Établissements ({restaurants.length})</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cliquez sur un restaurant pour gérer ses paramètres</p>
                        </div>
                        <Link to="/add-restaurant" className="btn btn-primary">
                            <PlusCircle size={18} /> Ajouter un Restaurant
                        </Link>
                    </div>
                    
                    {restaurants.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
                            <h2 style={{ marginBottom: '0.5rem' }}>Aucun restaurant</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Commencez par ajouter votre premier établissement</p>
                            <Link to="/add-restaurant" className="btn btn-primary">
                                <PlusCircle size={18} /> Créer mon premier restaurant
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            {restaurants.map(res => (
                                <div key={res.id} className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                    <div style={{ height: '160px', background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url(${res.image_url || `https://picsum.photos/seed/${res.id}/600/300`})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '1.2rem' }}>
                                        <div>
                                            <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{res.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                                                <MapPin size={14} /> {res.address}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                            <span style={{ fontWeight: '600' }}>{res.rating || 'Nouveau'}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {res.reviews_count || 0} avis</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button className="btn btn-secondary" style={{ flex: 1, minWidth: '100px' }} onClick={() => handleSelectRestaurant(res)}>
                                                <Clock size={16} /> Horaires
                                            </button>
                                            <button className="btn btn-secondary" style={{ flex: 1, minWidth: '100px' }} onClick={() => navigate(`/restaurants/${res.id}/edit`)}>
                                                <Edit size={16} /> Modifier
                                            </button>
                                            <button className="btn" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none' }} onClick={() => handleDeleteRestaurant(res.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                        <h2 style={{ marginBottom: '0.25rem' }}>Gestion des Réservations</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Confirmez ou annulez les demandes de réservation</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '1rem' }}>Client</th>
                                    <th style={{ padding: '1rem' }}>Restaurant</th>
                                    <th style={{ padding: '1rem' }}>Date & Heure</th>
                                    <th style={{ padding: '1rem' }}>Couverts</th>
                                    <th style={{ padding: '1rem' }}>Statut</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600' }}>{res.user?.name} {res.user?.last_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{res.restaurant?.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Calendar size={14} className="text-primary" /> {new Date(res.reservation_date).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <Clock size={14} /> {res.reservation_time}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                                {res.guests_count} 👤
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: res.status === 'confirmed' ? '#10b98120' : res.status === 'cancelled' ? '#ef444420' : '#f59e0b20', color: res.status === 'confirmed' ? '#10b981' : res.status === 'cancelled' ? '#ef4444' : '#f59e0b', textTransform: 'capitalize' }}>
                                                {res.status === 'pending' ? 'En attente' : res.status === 'confirmed' ? 'Confirmée' : 'Annulée'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {res.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button title="Confirmer" onClick={() => handleUpdateStatus(res.id, 'confirmed')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: '500' }}>
                                                        <Check size={16} /> Confirmer
                                                    </button>
                                                    <button title="Refuser" onClick={() => handleUpdateStatus(res.id, 'cancelled')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: '500' }}>
                                                        <X size={16} /> Refuser
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {reservations.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
                                            <p>Aucune réservation pour le moment</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
                !selectedRestaurant ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Sélectionnez un restaurant</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Choisissez un restaurant pour gérer ses horaires d'ouverture</p>
                        
                        {/* Restaurant Selector */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                            {restaurants.map(res => (
                                <button 
                                    key={res.id}
                                    onClick={() => handleSelectRestaurant(res)}
                                    style={{ 
                                        padding: '1.25rem', 
                                        border: '2px solid var(--border-color)', 
                                        borderRadius: '12px', 
                                        background: 'var(--card-bg)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{res.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <MapPin size={14} /> {res.address}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : loadingMenuData ? (
                    <div className="loader-container"><div className="loader"></div></div>
                ) : (
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <button onClick={() => setSelectedRestaurant(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Horaires - {selectedRestaurant.name}</h2>
                                </div>
                                <p style={{ color: 'var(--text-muted)', marginLeft: '2rem' }}>Définissez les heures d'ouverture et de fermeture pour chaque jour</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {days.map(day => (
                                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', flexWrap: 'wrap' }}>
                                    <span style={{ width: '140px', fontWeight: '600', fontSize: '1rem' }}>{dayLabels[day]}</span>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={hoursForm[day]?.is_closed || false} 
                                            onChange={(e) => setHoursForm(prev => ({ ...prev, [day]: { ...prev[day], is_closed: e.target.checked } }))} 
                                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                        />
                                        Fermé
                                    </label>
                                    {!hoursForm[day]?.is_closed && (
                                        <>
                                            <input 
                                                type="time" 
                                                value={hoursForm[day]?.open_time || ''} 
                                                onChange={(e) => setHoursForm(prev => ({ ...prev, [day]: { ...prev[day], open_time: e.target.value } }))} 
                                                className="input-base" 
                                                style={{ width: '140px', padding: '0.5rem' }} 
                                            />
                                            <span style={{ color: 'var(--text-muted)' }}>à</span>
                                            <input 
                                                type="time" 
                                                value={hoursForm[day]?.close_time || ''} 
                                                onChange={(e) => setHoursForm(prev => ({ ...prev, [day]: { ...prev[day], close_time: e.target.value } }))} 
                                                className="input-base" 
                                                style={{ width: '140px', padding: '0.5rem' }} 
                                            />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSaveHours} disabled={savingHours} className="btn btn-primary" style={{ marginTop: '2rem', padding: '0.75rem 2rem', fontSize: '1rem' }}>
                            <Save size={18} /> {savingHours ? 'Enregistrement...' : 'Enregistrer les horaires'}
                        </button>
                    </div>
                )
            )}

            {/* Menus Tab */}
            {activeTab === 'menus' && (
                !selectedRestaurant ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Sélectionnez un restaurant</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Choisissez un restaurant pour gérer ses menus</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                            {restaurants.map(res => (
                                <button 
                                    key={res.id}
                                    onClick={() => handleSelectRestaurant(res)}
                                    style={{ 
                                        padding: '1.25rem', 
                                        border: '2px solid var(--border-color)', 
                                        borderRadius: '12px', 
                                        background: 'var(--card-bg)',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{res.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{res.cuisine_type}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : loadingMenuData ? (
                    <div className="loader-container"><div className="loader"></div></div>
                ) : (
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button onClick={() => setSelectedRestaurant(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Menus - {selectedRestaurant.name}</h2>
                                </div>
                            </div>
                        </div>
                        
                        {/* Create Menu Form */}
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Créer un nouveau menu</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Nom du menu *</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Menu Petit-déjeuner, Carte des vins..." 
                                        value={menuForm.name} 
                                        onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} 
                                        className="input-base" 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Description</label>
                                    <input 
                                        type="text" 
                                        placeholder="Description breve du menu" 
                                        value={menuForm.description} 
                                        onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} 
                                        className="input-base" 
                                    />
                                </div>
                                <button onClick={handleCreateMenu} className="btn btn-primary" style={{ height: '42px' }}>
                                    <PlusCircle size={18} /> Créer
                                </button>
                            </div>
                        </div>
                        
                        {/* Existing Menus */}
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Menus existants</h3>
                        {restaurantMenus.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                <p>Aucun menu créé pour ce restaurant</p>
                                <p>Créez votre premier menu ci-dessus !</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {restaurantMenus.map(menu => (
                                    <div key={menu.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                                        {/* Menu Header */}
                                        <div 
                                            style={{ 
                                                padding: '1.25rem', 
                                                backgroundColor: 'var(--bg-secondary)', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => toggleMenuExpand(menu.id)}
                                        >
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{menu.name}</h4>
                                                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{menu.description || 'Aucune description'}</p>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem', display: 'block' }}>
                                                    {menu.menu_items?.length || 0} article(s)
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedMenu(selectedMenu?.id === menu.id ? null : menu); }}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                                >
                                                    {selectedMenu?.id === menu.id ? '✕ Fermer' : '+ Ajouter article'}
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteMenu(menu.id); }}
                                                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.5rem' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                {expandedMenus[menu.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                        
                                        {/* Add Item Form */}
                                        {selectedMenu?.id === menu.id && (
                                            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                                                <h5 style={{ marginBottom: '1rem' }}>Ajouter un article au menu</h5>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Nom de l'article *" 
                                                        value={itemForm.name} 
                                                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} 
                                                        className="input-base" 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Catégorie (Entrée, Plat...)" 
                                                        value={itemForm.category} 
                                                        onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} 
                                                        className="input-base" 
                                                    />
                                                    <input 
                                                        type="number" 
                                                        placeholder="Prix (€) *" 
                                                        value={itemForm.price} 
                                                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} 
                                                        className="input-base" 
                                                        step="0.01"
                                                    />
                                                    <button onClick={handleAddMenuItem} className="btn btn-primary">
                                                        Ajouter
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Menu Items List */}
                                        {expandedMenus[menu.id] && menu.menu_items?.length > 0 && (
                                            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {menu.menu_items.map(item => (
                                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                                            <div>
                                                                <span style={{ fontWeight: '600' }}>{item.name}</span>
                                                                {item.category && <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{item.category}</span>}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>{item.price} €</span>
                                                                <button onClick={() => handleDeleteMenuItem(item.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
                !selectedRestaurant ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Sélectionnez un restaurant</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Choisissez un restaurant pour gérer sa galerie photos</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                            {restaurants.map(res => (
                                <button 
                                    key={res.id}
                                    onClick={() => handleSelectRestaurant(res)}
                                    style={{ 
                                        padding: '1.25rem', 
                                        border: '2px solid var(--border-color)', 
                                        borderRadius: '12px', 
                                        background: 'var(--card-bg)',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{res.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{res.photos?.length || 0} photos</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button onClick={() => setSelectedRestaurant(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Galerie Photos - {selectedRestaurant.name}</h2>
                                </div>
                            </div>
                        </div>
                        
                        {/* Upload Section */}
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Ajouter une photo</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                                <div style={{ flex: 1 }}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setPhotoFile(e.target.files[0])} 
                                        className="input-base"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <button onClick={handleAddPhoto} disabled={!photoFile} className="btn btn-primary">
                                    <Image size={18} /> Téléverser
                                </button>
                            </div>
                        </div>
                        
                        {/* Photos Grid */}
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Photos ({restaurantPhotos.length})</h3>
                        {restaurantPhotos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
                                <p>Aucune photo dans la galerie</p>
                                <p>Ajoutez votre première photo ci-dessus !</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                {restaurantPhotos.map(photo => (
                                    <div key={photo.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1' }}>
                                        <img 
                                            src={photo.url} 
                                            alt="" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                        <button 
                                            onClick={() => handleDeletePhoto(photo.id)} 
                                            style={{ 
                                                position: 'absolute', 
                                                top: '0.5rem', 
                                                right: '0.5rem', 
                                                backgroundColor: 'rgba(220,38,38,0.9)', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '50%', 
                                                width: '32px', 
                                                height: '32px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default RestaurateurDashboard;
