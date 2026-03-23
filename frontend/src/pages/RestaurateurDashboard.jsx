import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin, Users, Calendar, Star, Check, X, Clock, Store, Image, Save } from 'lucide-react';
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
            const [menusRes, hoursRes] = await Promise.all([
                api.get(`/restaurants/${restaurantId}/menus`),
                api.get(`/restaurants/${restaurantId}/working-hours`)
            ]);
            setRestaurantMenus(menusRes.data);
            setRestaurantWorkingHours(hoursRes.data);
            
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
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/reservations/${id}/status`, { status });
            setReservations(prev => prev.map(res =>
                res.id === id ? { ...res, status } : res
            ));
            toast.success(`Le statut a été mis à jour avec succès : ${status}`);
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    const handleDeleteRestaurant = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce restaurant ?')) {
            try {
                await api.delete(`/restaurants/${id}`);
                setRestaurants(restaurants.filter(r => r.id !== id));
                toast.success('Le restaurant a été supprimé avec succès.');
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
            toast.success('Horaires enregistrés avec succès !');
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement des horaires');
        } finally {
            setSavingHours(false);
        }
    };

    const handleCreateMenu = async () => {
        if (!selectedRestaurant) return;
        try {
            await api.post(`/restaurants/${selectedRestaurant.id}/menus`, menuForm);
            toast.success('Menu créé avec succès !');
            setMenuForm({ name: '', description: '', price: '' });
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('Erreur lors de la création du menu');
        }
    };

    const handleAddMenuItem = async () => {
        if (!selectedMenu) return;
        try {
            await api.post(`/restaurants/${selectedRestaurant.id}/menu-items`, {
                ...itemForm,
                menu_id: selectedMenu.id,
                price: parseFloat(itemForm.price)
            });
            toast.success('Article ajouté avec succès !');
            setItemForm({ name: '', description: '', price: '', category: '' });
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('Erreur lors de l\'ajout de l\'article');
        }
    };

    const handleAddPhoto = async () => {
        if (!selectedRestaurant || !photoFile) return;
        try {
            const formData = new FormData();
            formData.append('image', photoFile);
            formData.append('restaurant_id', selectedRestaurant.id);
            formData.append('type', 'restaurant');
            await api.post('/photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Photo ajoutée avec succès !');
            setPhotoFile(null);
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('Erreur lors de l\'ajout de la photo');
        }
    };

    const handleDeleteMenu = async (menuId) => {
        if (!window.confirm('Voulez-vous supprimer ce menu ?')) return;
        try {
            await api.delete(`/menus/${menuId}`);
            toast.success('Menu supprimé');
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleDeletePhoto = async (photoId) => {
        try {
            await api.delete(`/photos/${photoId}`);
            toast.success('Photo supprimée');
            fetchRestaurantData(selectedRestaurant.id);
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    const stats = [
        { label: 'Restaurants', value: backendStats?.restaurants_count || 0, icon: <Store size={20} />, color: '#6366f1' },
        { label: 'Réservations', value: backendStats?.total_reservations || 0, icon: <Calendar size={20} />, color: '#10b981' },
        { label: 'Note Moyenne', value: (backendStats?.average_rating || 0).toFixed(1), icon: <Star size={20} />, color: '#f59e0b' },
        { label: 'Avis Totaux', value: backendStats?.total_reviews || 0, icon: <Users size={20} />, color: '#ec4899' },
    ];

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = {
        monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi',
        thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Tableau de bord CEO</h1>
                <p style={{ color: 'var(--text-muted)' }}>Gérez votre empire culinaire et suivez vos performances.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                        <div style={{ backgroundColor: stat.color + '20', color: stat.color, padding: '1rem', borderRadius: '12px' }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
                <button onClick={() => setActiveTab('overview')} style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    Mes Restaurants
                </button>
                <button onClick={() => setActiveTab('reservations')} style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'reservations' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'reservations' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    Réservations
                </button>
                <button onClick={() => setActiveTab('schedules')} style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'schedules' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'schedules' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    Horaires
                </button>
                <button onClick={() => setActiveTab('menus')} style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'menus' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'menus' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    Cartes & Menus
                </button>
                <button onClick={() => setActiveTab('photos')} style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'photos' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'photos' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    Galerie Photos
                </button>
            </div>

            {activeTab === 'overview' ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.4rem' }}>Établissements ({restaurants.length})</h2>
                        <Link to="/add-restaurant" className="btn btn-primary">
                            <PlusCircle size={18} /> Nouvel Établissement
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {restaurants.map(res => (
                            <div key={res.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ height: '140px', background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${res.image_url || `https://picsum.photos/seed/${res.id}/600/300`})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end', padding: '1.2rem' }}>
                                    <h3 style={{ color: 'white', fontSize: '1.3rem' }}>{res.name}</h3>
                                </div>
                                <div style={{ padding: '1.2rem' }}>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                                        <MapPin size={16} /> {res.address}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <button className="btn btn-secondary" style={{ flex: 1, minWidth: '120px', height: '40px', fontSize: '0.85rem' }} onClick={() => handleSelectRestaurant(res)}>
                                            <Clock size={16} /> Horaires
                                        </button>
                                        <button className="btn btn-secondary" style={{ flex: 1, minWidth: '120px', height: '40px', fontSize: '0.85rem' }} onClick={() => navigate(`/restaurants/${res.id}/edit`)}>
                                            <Edit size={16} /> Éditer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : activeTab === 'reservations' ? (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '1.2rem' }}>Client</th>
                                    <th style={{ padding: '1.2rem' }}>Restaurant</th>
                                    <th style={{ padding: '1.2rem' }}>Date & Heure</th>
                                    <th style={{ padding: '1.2rem' }}>Couverts</th>
                                    <th style={{ padding: '1.2rem' }}>Statut</th>
                                    <th style={{ padding: '1.2rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ fontWeight: '600' }}>{res.user?.name} {res.user?.last_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '1.2rem', fontWeight: '500' }}>{res.restaurant?.name}</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Calendar size={14} className="text-primary" /> {new Date(res.reservation_date).toLocaleDateString()}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <Clock size={14} /> {res.reservation_time}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>{res.guests_count}</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: res.status === 'confirmed' ? '#10b98120' : res.status === 'cancelled' ? '#ef444420' : '#f59e0b20', color: res.status === 'confirmed' ? '#10b981' : res.status === 'cancelled' ? '#ef4444' : '#f59e0b', textTransform: 'uppercase' }}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            {res.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button title="Confirmer" onClick={() => handleUpdateStatus(res.id, 'confirmed')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                        <Check size={16} />
                                                    </button>
                                                    <button title="Refuser" onClick={() => handleUpdateStatus(res.id, 'cancelled')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {reservations.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune réservation reçue pour le moment.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'schedules' ? (
                !selectedRestaurant ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Sélectionnez un restaurant</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Choisissez un restaurant pour gérer ses horaires.</p>
                    </div>
                ) : loadingMenuData ? (
                    <div className="loader-container"><div className="loader"></div></div>
                ) : (
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Horaires - {selectedRestaurant.name}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>Gérez les heures d'ouverture et de fermeture</p>
                            </div>
                            <button onClick={() => setSelectedRestaurant(null)} className="btn btn-secondary">Changer</button>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {days.map(day => (
                                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                    <span style={{ width: '120px', fontWeight: '600' }}>{dayLabels[day]}</span>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={hoursForm[day]?.is_closed || false} onChange={(e) => setHoursForm(prev => ({ ...prev, [day]: { ...prev[day], is_closed: e.target.checked } }))} />
                                        Fermé
                                    </label>
                                    {!hoursForm[day]?.is_closed && (
                                        <>
                                            <input type="time" value={hoursForm[day]?.open_time || ''} onChange={(e) => setHoursForm(prev => ({ ...prev, [day]: { ...prev[day], open_time: e.target.value } }))} className="input-base" style={{ width: '140px' }} />
                                            <span>-</span>
                                            <input type="time" value={hoursForm[day]?.close_time || ''} onChange={(e) => setHoursForm(prev => ({ ...prev, [day]: { ...prev[day], close_time: e.target.value } }))} className="input-base" style={{ width: '140px' }} />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSaveHours} disabled={savingHours} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                            <Save size={18} /> {savingHours ? 'Enregistrement...' : 'Enregistrer les horaires'}
                        </button>
                    </div>
                )
            ) : activeTab === 'menus' ? (
                !selectedRestaurant ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Sélectionnez un restaurant</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Choisissez un restaurant pour gérer ses menus.</p>
                    </div>
                ) : loadingMenuData ? (
                    <div className="loader-container"><div className="loader"></div></div>
                ) : (
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Menus - {selectedRestaurant.name}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>Gérez les cartes et les menus</p>
                            </div>
                            <button onClick={() => setSelectedRestaurant(null)} className="btn btn-secondary">Changer</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Créer un menu</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input type="text" placeholder="Nom du menu" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} className="input-base" />
                                    <textarea placeholder="Description" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} className="input-base" rows={3} />
                                    <button onClick={handleCreateMenu} className="btn btn-primary"><PlusCircle size={18} /> Créer le menu</button>
                                </div>
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Menus existants</h3>
                                {restaurantMenus.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>Aucun menu créé. Créez votre premier menu !</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {restaurantMenus.map(menu => (
                                            <div key={menu.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <h4 style={{ margin: 0 }}>{menu.name}</h4>
                                                    <button onClick={() => handleDeleteMenu(menu.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                </div>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{menu.description}</p>
                                                <button onClick={() => setSelectedMenu(menu)} className="btn btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>+ Ajouter un article</button>
                                                
                                                {selectedMenu?.id === menu.id && (
                                                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                                        <h5 style={{ marginBottom: '0.5rem' }}>Nouvel article</h5>
                                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            <input type="text" placeholder="Nom" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className="input-base" style={{ flex: 1, minWidth: '120px' }} />
                                                            <input type="text" placeholder="Catégorie" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} className="input-base" style={{ flex: 1, minWidth: '120px' }} />
                                                            <input type="number" placeholder="Prix" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} className="input-base" style={{ width: '100px' }} />
                                                            <button onClick={handleAddMenuItem} className="btn btn-primary">Ajouter</button>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {menu.menu_items?.length > 0 && (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <h5 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Articles</h5>
                                                        {menu.menu_items.map(item => (
                                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                                                <span>{item.name}</span>
                                                                <span style={{ color: 'var(--primary)' }}>{item.price} €</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            ) : activeTab === 'photos' ? (
                !selectedRestaurant ? (
                    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Sélectionnez un restaurant</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Choisissez un restaurant pour gérer ses photos.</p>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Photos - {selectedRestaurant.name}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>Gérez la galerie photos</p>
                            </div>
                            <button onClick={() => setSelectedRestaurant(null)} className="btn btn-secondary">Changer</button>
                        </div>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Ajouter une photo</h3>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="input-base" style={{ flex: 1 }} />
                                <button onClick={handleAddPhoto} disabled={!photoFile} className="btn btn-primary">
                                    <Image size={18} /> Ajouter
                                </button>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {restaurantPhotos.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>Aucune photo. Ajoutez votre première photo !</p>
                            ) : restaurantPhotos.map(photo => (
                                <div key={photo.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img src={photo.url} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                    <button onClick={() => handleDeletePhoto(photo.id)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Section en cours de finalisation</h2>
                    <p style={{ color: 'var(--text-muted)' }}>L'interface de gestion des {activeTab} sera bientôt disponible.</p>
                </div>
            )}
        </div>
    );
};

export default RestaurateurDashboard;
