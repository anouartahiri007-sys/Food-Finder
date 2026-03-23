import { useState, useEffect } from 'react';
import { Users, Store, Clock, Mail, ShieldCheck, Search, Download, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

// Helper to get full image URL
const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');
    const prefix = url.startsWith('/') ? '' : '/';
    return `${API_BASE_URL}${prefix}${url}`;
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [blacklistedUsers, setBlacklistedUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('clients');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const userRes = await api.get('/profile');
                if (userRes.data.role !== 'admin') {
                    navigate('/');
                    return;
                }

                const [clientsRes, resRes, blacklistRes, reportsRes, statsRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/restaurants'),
                    api.get('/admin/blacklist'),
                    api.get('/admin/reports'),
                    api.get('/admin/stats'),
                ]);
                setClients(clientsRes.data);
                setRestaurants(resRes.data);
                setBlacklistedUsers(blacklistRes.data);
                setReports(reportsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error(err);
                toast.error('Erreur de chargement des données');
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, [navigate]);

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    const filteredClients = clients.filter(c =>
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRestaurants = restaurants.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Delete restaurant handler
    const handleDeleteRestaurant = async (id, name) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
            return;
        }
        try {
            await api.delete(`/admin/restaurants/${id}`);
            setRestaurants(restaurants.filter(r => r.id !== id));
            toast.success('Restaurant supprimé avec succès');
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la suppression');
        }
    };

    // Delete (block) user handler
    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir bloquer "${name}" ? Cette action empêchera l'utilisateur de se connecter.`)) {
            return;
        }
        try {
            await api.post(`/admin/users/${id}/blacklist`);
            setClients(clients.filter(c => c.id !== id));
            // Also add to blacklist
            const user = clients.find(c => c.id === id);
            if (user) {
                setBlacklistedUsers([...blacklistedUsers, { ...user, is_blocked: true }]);
            }
            toast.success('Utilisateur bloqué et ajouté à la blacklist');
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors du blocage');
        }
    };

    // Unblacklist user handler
    const handleUnblacklistUser = async (id, name) => {
        if (!window.confirm(`Voulez-vous retirer "${name}" de la blacklist ?`)) {
            return;
        }
        try {
            await api.post(`/admin/users/${id}/unblacklist`);
            setBlacklistedUsers(blacklistedUsers.filter(u => u.id !== id));
            // Also update the clients list
            const clientsRes = await api.get('/admin/users');
            setClients(clientsRes.data);
            toast.success('Utilisateur retiré de la blacklist');
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    // Add to blacklist handler (from clients list)
    const handleBlacklistUser = async (id, name) => {
        if (!window.confirm(`Voulez-vous ajouter "${name}" à la blacklist ?`)) {
            return;
        }
        try {
            await api.post(`/admin/users/${id}/blacklist`);
            const user = clients.find(c => c.id === id);
            if (user) {
                setBlacklistedUsers([...blacklistedUsers, { ...user, is_blocked: true }]);
            }
            // Also update the clients list
            const clientsRes = await api.get('/admin/users');
            setClients(clientsRes.data);
            toast.success('Utilisateur ajouté à la blacklist');
        } catch (err) {
            console.error(err);
            toast.error('Erreur lors de la mise à jour');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Admin Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldCheck size={32} color="var(--danger)" /> SaaS Administration
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Contrôle global des utilisateurs et des établissements.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input-base"
                            placeholder="Rechercher..."
                            style={{ paddingLeft: '40px', width: '250px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => toast.info('Export CSV est en cours de développement.')}>
                        <Download size={18} /> Exporter CSV
                    </button>
                </div>
            </div>

            {/* Admin Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Utilisateurs Clients</span>
                        <Users size={20} color="#6366f1" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{clients.length}</h2>
                    <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.5rem' }}>+12% ce mois-ci</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Restaurants Partenaires</span>
                        <Store size={20} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{restaurants.length}</h2>
                    <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '0.5rem' }}>+5 nouveaux cette semaine</div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Signalements en attente</span>
                        <Clock size={20} color="#f59e0b" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.pending_reports ?? '-'}</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Avis signalés</div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveTab('clients')} 
                    style={{ padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'clients' ? 'var(--danger)' : 'var(--text-muted)', borderBottom: activeTab === 'clients' ? '3px solid var(--danger)' : 'none', whiteSpace: 'nowrap' }}> 
                    Gestion des Clients 
                </button>
                <button
                    onClick={() => setActiveTab('restaurants')}
                    style={{ padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'restaurants' ? 'var(--danger)' : 'var(--text-muted)', borderBottom: activeTab === 'restaurants' ? '3px solid var(--danger)' : 'none', whiteSpace: 'nowrap' }}>
                    Audit des Restaurants
                </button>
                <button 
                    onClick={() => setActiveTab('reports')} 
                    style={{ padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'reports' ? 'var(--danger)' : 'var(--text-muted)', borderBottom: activeTab === 'reports' ? '3px solid var(--danger)' : 'none', whiteSpace: 'nowrap' }}> 
                    Signalements Avis
                </button>
                <button 
                    onClick={() => setActiveTab('blacklist')} 
                    style={{ padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'blacklist' ? 'var(--danger)' : 'var(--text-muted)', borderBottom: activeTab === 'blacklist' ? '3px solid var(--danger)' : 'none', whiteSpace: 'nowrap' }}>
                    Black List
                </button>
            </div>

            {/* Content Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--border-color)' }}> 
                            {activeTab === 'clients' ? ( 
                                <tr> 
                                    <th style={{ padding: '1.2rem' }}>Utilisateur</th>
                                    <th style={{ padding: '1.2rem' }}>Email</th>
                                    <th style={{ padding: '1.2rem' }}>Dernière Connexion</th>
                                    <th style={{ padding: '1.2rem' }}>Dernière Déconnexion</th>
                                    <th style={{ padding: '1.2rem' }}>Statut</th>
                                    <th style={{ padding: '1.2rem' }}>Actions</th>
                                </tr>
                            ) : activeTab === 'restaurants' ? (
                                <tr>
                                    <th style={{ padding: '1.2rem' }}>Établissement</th>
                                    <th style={{ padding: '1.2rem' }}>Cuisine & Prix</th>
                                    <th style={{ padding: '1.2rem' }}>Téléphone</th>
                                    <th style={{ padding: '1.2rem' }}>Site</th>
                                    <th style={{ padding: '1.2rem' }}>Actions</th>
                                </tr>
                            ) : activeTab === 'blacklist' ? (
                                <tr>
                                    <th style={{ padding: '1.2rem' }}>Utilisateur</th>
                                    <th style={{ padding: '1.2rem' }}>Rôle</th>
                                    <th style={{ padding: '1.2rem' }}>Date d'inscription</th>
                                    <th style={{ padding: '1.2rem' }}>Statut</th>
                                    <th style={{ padding: '1.2rem' }}>Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th style={{ padding: '1.2rem' }}>Signalement</th>
                                    <th style={{ padding: '1.2rem' }}>Avis</th>
                                    <th style={{ padding: '1.2rem' }}>Restaurant</th>
                                    <th style={{ padding: '1.2rem' }}>Date</th>
                                    <th style={{ padding: '1.2rem' }}>Actions</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {activeTab === 'clients' ? (
                                filteredClients.length > 0 ? (
                                    filteredClients.map(client => (
                                        <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}> 
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}> 
                                                        {client.name?.[0] || ''}{client.last_name?.[0] || ''} 
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700' }}>{client.name} {client.last_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}> 
                                                    <Mail size={14} /> {client.email} 
                                                </div> 
                                            </td> 
                                            <td style={{ padding: '1.2rem' }}>{formatDate(client.last_login_at)}</td> 
                                            <td style={{ padding: '1.2rem' }}>{formatDate(client.last_logout_at)}</td>
                                            <td style={{ padding: '1.2rem' }}>
                                                {client.is_blocked ? (
                                                    <span style={{ color: 'var(--danger)', fontWeight: '600' }}>Bloqué</span>
                                                ) : (
                                                    <span style={{ color: 'var(--success)', fontWeight: '600' }}>Actif</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                {client.role !== 'admin' && (
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ color: 'var(--danger)', padding: '0.5rem' }} 
                                                        onClick={() => handleDeleteUser(client.id, client.name || client.email)}
                                                        title="Bloquer l'utilisateur"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Aucun client trouvé
                                        </td>
                                    </tr>
                                )
                            ) : activeTab === 'restaurants' ? ( 
                                filteredRestaurants.length > 0 ? (
                                    filteredRestaurants.map(res => ( 
                                        <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}> 
                                            <td style={{ padding: '1.2rem' }}> 
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <img src={getFullImageUrl(res.image_url) || 'https://via.placeholder.com/50'} alt={res.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                                    <div>
                                                        <div style={{ fontWeight: '700' }}>{res.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{res.address}</div>
                                                    </div>
                                                </div> 
                                            </td> 
                                            <td style={{ padding: '1.2rem' }}> 
                                                <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{res.cuisine_type}</div> 
                                                <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{res.price_range}</div> 
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>{res.phone || '-'}</td>
                                            <td style={{ padding: '1.2rem' }}>
                                                {res.website ? (
                                                    <a href={res.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        Visiter <ExternalLink size={14} />
                                                    </a>
                                                ) : '-'}
                                            </td> 
                                            <td style={{ padding: '1.2rem' }}> 
                                                <button className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '0.5rem' }} onClick={() => handleDeleteRestaurant(res.id, res.name)}>
                                                    <Trash2 size={18} />
                                                </button> 
                                            </td> 
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Aucun restaurant trouvé
                                        </td>
                                    </tr>
                                )
                            ) : activeTab === 'reports' ? (
                                reports.length > 0 ? (
                                    reports.map(report => (
                                        <tr key={report.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1.2rem' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--danger)' }}>#{report.id}</span>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{report.reason || 'Sans motif'}</div>
                                            </td>
                                            <td style={{ padding: '1.2rem', maxWidth: '250px' }}>
                                                <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                                                    {report.review?.comment || '-'}
                                                </p>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>{report.review?.restaurant?.name || '-'}</td>
                                            <td style={{ padding: '1.2rem' }}>{formatDate(report.created_at)}</td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ color: 'var(--danger)', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                                        onClick={async () => {
                                                            await api.post(`/admin/reviews/${report.review_id}/moderate`, { action: 'delete' });
                                                            setReports(reports.filter(r => r.id !== report.id));
                                                            toast.success('Avis supprimé');
                                                        }}
                                                    >Supprimer</button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                                        onClick={async () => {
                                                            await api.post(`/admin/reviews/${report.review_id}/moderate`, { action: 'keep' });
                                                            setReports(reports.filter(r => r.id !== report.id));
                                                            toast.success('Avis conservé');
                                                        }}
                                                    >Conserver</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            Aucun signalement pour le moment.
                                        </td>
                                    </tr>
                                )
                            ) : activeTab === 'blacklist' ? (
                                blacklistedUsers.length > 0 ? (
                                    blacklistedUsers.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{user.name || '-'} {user.last_name || ''}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <span style={{ color: 'var(--danger)', fontWeight: '600' }}>Bloqué</span>
                                            </td>
                                            <td style={{ padding: '1.2rem' }}>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    style={{ color: 'var(--success)', padding: '0.5rem' }} 
                                                    onClick={() => handleUnblacklistUser(user.id, user.name || user.email)}
                                                    title="Retirer de la blacklist"
                                                >
                                                    <ShieldCheck size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div> 
                                            <h3 style={{ marginBottom: '0.5rem' }}>Liste Noire</h3> 
                                            <p style={{ color: 'var(--text-muted)' }}>Aucun utilisateur bloqué</p> 
                                        </td>
                                    </tr>
                                )
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Aucune donnée disponible.
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
