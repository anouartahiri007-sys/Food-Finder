import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, Mail, Calendar, Camera, Save, MapPin, Clock, Phone, Globe, 
    Utensils, DollarSign, Users, Star, TrendingUp, Edit, Plus, Trash2,
    Image, Building, CalendarDays
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const RestaurantProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    
    // User profile form
    const [userForm, setUserForm] = useState({
        name: '',
        last_name: '',
        phone: '',
        description: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Restaurant form
    const [restaurantForm, setRestaurantForm] = useState(null);
    const [editingRestaurant, setEditingRestaurant] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/profile');
                setUser(userRes.data);
                setUserForm({
                    name: userRes.data.name || '',
                    last_name: userRes.data.last_name || '',
                    phone: userRes.data.phone || '',
                    description: userRes.data.description || ''
                });
                if (userRes.data.profile_photo) {
                    setPhotoPreview(userRes.data.profile_photo);
                }

                // Fetch owner's restaurants
                const restaurantsRes = await api.get('/owner/restaurants');
                setRestaurants(restaurantsRes.data);
            } catch (err) {
                console.error('Error fetching profile data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUserPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();
            data.append('name', userForm.name);
            data.append('last_name', userForm.last_name);
            data.append('phone', userForm.phone);
            data.append('description', userForm.description);
            if (photoFile) {
                data.append('profile_photo', photoFile);
            }

            const response = await api.post('/profile/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(response.data.user);
            toast.success('Profil mis à jour avec succès !');
        } catch (err) {
            toast.error('Erreur lors de la mise à jour du profil.');
        } finally {
            setSaving(false);
        }
    };

    // Stats for dashboard
    const totalReservations = restaurants.reduce((acc, r) => acc + (r.reservations_count || 0), 0);
    const totalReviews = restaurants.reduce((acc, r) => acc + (r.reviews_count || 0), 0);
    const averageRating = restaurants.length > 0 
        ? (restaurants.reduce((acc, r) => acc + (r.rating || 0), 0) / restaurants.length).toFixed(1)
        : 0;

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <style>{`
                .restaurant-profile-header {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    margin-bottom: 2rem;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 1.25rem;
                    text-align: center;
                }
                .tab-buttons {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 0.5rem;
                }
                .tab-button {
                    padding: 0.75rem 1.5rem;
                    background: none;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--text-muted);
                    transition: all 0.2s ease;
                }
                .tab-button.active {
                    background: var(--primary);
                    color: white;
                }
                .restaurant-card {
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    margin-bottom: 1rem;
                }
                .restaurant-card-header {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                }
                .restaurant-card-image {
                    width: 120px;
                    height: 80px;
                    border-radius: var(--radius-md);
                    object-fit: cover;
                }
            `}</style>

            {/* Header */}
            <div className="restaurant-profile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src={photoPreview || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=100`}
                            alt="Profile"
                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }}
                        />
                        <label
                            htmlFor="photo-upload"
                            style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
                        >
                            <Camera size={16} />
                        </label>
                        <input id="photo-upload" type="file" hidden onChange={handleUserPhotoChange} accept="image/*" />
                    </div>
                    <div>
                        <h1 style={{ margin: '0 0 0.5rem 0' }}>{user?.name} {user?.last_name}</h1>
                        <p style={{ margin: 0, opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Utensils size={16} /> Restaurateur
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7, fontSize: '0.9rem' }}>
                            <Mail size={14} style={{ marginRight: '0.3rem' }} /> {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <Building size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{restaurants.length}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Établissements</p>
                </div>
                <div className="stat-card">
                    <CalendarDays size={24} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{totalReservations}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Réservations</p>
                </div>
                <div className="stat-card">
                    <Star size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{averageRating}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Note moyenne</p>
                </div>
                <div className="stat-card">
                    <TrendingUp size={24} color="var(--info)" style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{totalReviews}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Avis clients</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tab-buttons">
                <button 
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={16} style={{ marginRight: '0.5rem' }} /> Mon Profil
                </button>
                <button 
                    className={`tab-button ${activeTab === 'restaurants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('restaurants')}
                >
                    <Utensils size={16} style={{ marginRight: '0.5rem' }} /> Mes Restaurants
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Informations du compte</h2>
                    <form onSubmit={handleUserSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Prénom</label>
                                <input
                                    type="text"
                                    className="input-base"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nom</label>
                                <input
                                    type="text"
                                    className="input-base"
                                    value={userForm.last_name}
                                    onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Téléphone</label>
                                <input
                                    type="tel"
                                    className="input-base"
                                    value={userForm.phone}
                                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                                    placeholder="+212 ..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="input-base"
                                    value={user?.email || ''}
                                    disabled
                                    style={{ opacity: 0.6 }}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Bio / Description</label>
                                <textarea
                                    className="input-base"
                                    rows="4"
                                    value={userForm.description}
                                    onChange={(e) => setUserForm({ ...userForm, description: e.target.value })}
                                    placeholder="Parlez-nous de votre activité..."
                                ></textarea>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={saving}>
                            <Save size={18} /> {saving ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                    </form>
                </div>
            )}

            {/* Restaurants Tab */}
            {activeTab === 'restaurants' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2>Mes Établissements</h2>
                        <button className="btn btn-primary" onClick={() => navigate('/add-restaurant')}>
                            <Plus size={18} /> Ajouter un restaurant
                        </button>
                    </div>

                    {restaurants.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <Utensils size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
                            <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Aucun restaurant</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Commencez par ajouter votre premier établissement</p>
                            <button className="btn btn-primary" onClick={() => navigate('/add-restaurant')}>
                                <Plus size={18} /> Ajouter un restaurant
                            </button>
                        </div>
                    ) : (
                        restaurants.map(restaurant => (
                            <div key={restaurant.id} className="restaurant-card">
                                <div className="restaurant-card-header">
                                    <img 
                                        src={restaurant.image_url || 'https://picsum.photos/seed/restaurant/200/150'} 
                                        alt={restaurant.name}
                                        className="restaurant-card-image"
                                    />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{restaurant.name}</h3>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={14} /> {restaurant.address}
                                        </p>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Star size={14} color="#f59e0b" /> {restaurant.rating || 'Nouveau'}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <DollarSign size={14} color="var(--success)" /> {restaurant.price_range}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Clock size={14} /> {restaurant.opening_time} - {restaurant.closing_time}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ padding: '0.5rem 1rem' }}
                                            onClick={() => navigate(`/restaurants/${restaurant.id}/edit`)}
                                        >
                                            <Edit size={14} /> Modifier
                                        </button>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ padding: '0.5rem 1rem' }}
                                            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                                        >
                                            Voir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default RestaurantProfile;
