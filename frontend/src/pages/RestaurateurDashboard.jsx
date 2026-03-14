import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin, Users, Calendar, Star, Check, X, Clock, Store } from 'lucide-react';
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

    const [backendStats, setBackendStats] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch user first
                const userRes = await api.get('/profile');
                setUser(userRes.data);

                // Then restaurants
                const resRes = await api.get('/owner/restaurants');
                setRestaurants(resRes.data);

                // Then reservations
                const reservationsRes = await api.get('/owner/reservations');
                setReservations(reservationsRes.data);

                // Fetch real stats
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

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    const stats = [
        { label: 'Restaurants', value: backendStats?.restaurants_count || 0, icon: <Store size={20} />, color: '#6366f1' },
        { label: 'Réservations', value: backendStats?.total_reservations || 0, icon: <Calendar size={20} />, color: '#10b981' },
        { label: 'Note Moyenne', value: (backendStats?.average_rating || 0).toFixed(1), icon: <Star size={20} />, color: '#f59e0b' },
        { label: 'Avis Totaux', value: backendStats?.total_reviews || 0, icon: <Users size={20} />, color: '#ec4899' },
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* SaaS Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Tableau de bord CEO</h1>
                <p style={{ color: 'var(--text-muted)' }}>Gérez votre empire culinaire et suivez vos performances.</p>
            </div>

            {/* Stats Grid */}
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

            {/* Main Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                    Mes Restaurants
                </button>
                <button
                    onClick={() => setActiveTab('reservations')}
                    style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'reservations' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'reservations' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                    Réservations
                </button>
                <button
                    onClick={() => setActiveTab('schedules')}
                    style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'schedules' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'schedules' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                    Horaires
                </button>
                <button
                    onClick={() => setActiveTab('menus')}
                    style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'menus' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'menus' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
                    Cartes & Menus
                </button>
                <button
                    onClick={() => setActiveTab('photos')}
                    style={{ padding: '0.8rem 1rem', background: 'none', border: 'none', color: activeTab === 'photos' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'photos' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}
                >
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
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button className="btn btn-secondary" style={{ flex: 1, height: '40px', fontSize: '0.85rem' }} onClick={() => navigate(`/restaurants/${res.id}/edit`)}>
                                            <Edit size={16} /> Éditer
                                        </button>
                                        <button className="btn btn-secondary" style={{ flex: 1, height: '40px', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDeleteRestaurant(res.id)}>
                                            <Trash2 size={16} /> Supprimer
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
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: res.status === 'confirmed' ? '#10b98120' : res.status === 'cancelled' ? '#ef444420' : '#f59e0b20',
                                                color: res.status === 'confirmed' ? '#10b981' : res.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                                                textTransform: 'uppercase'
                                            }}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            {res.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        title="Confirmer"
                                                        onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                                                        style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        title="Refuser"
                                                        onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                                                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {reservations.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Aucune réservation reçue pour le moment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
