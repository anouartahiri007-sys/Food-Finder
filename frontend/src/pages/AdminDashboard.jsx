import { useState, useEffect } from 'react';
import { Users, Store, Clock, Mail, ShieldCheck, Search, Download, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
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

                const clientsRes = await api.get('/admin/users');
                setClients(clientsRes.data);

                const resRes = await api.get('/admin/restaurants');
                setRestaurants(resRes.data);
            } catch (err) {
                console.error(err);
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, [navigate]);

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    const filteredClients = clients.filter(c =>
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRestaurants = restaurants.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Admin Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldCheck size={32} color="var(--danger)" /> SaaS Administration
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Contrôle global des utilisateurs et des établissements.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
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
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Connexions Aujourd'hui</span>
                        <Clock size={20} color="#f59e0b" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>42</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Pic à 12:45</div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('clients')}
                    style={{ padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'clients' ? 'var(--danger)' : 'var(--text-muted)', borderBottom: activeTab === 'clients' ? '3px solid var(--danger)' : 'none' }}>
                    Gestion des Clients
                </button>
                <button
                    onClick={() => setActiveTab('restaurants')}
                    style={{ padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'restaurants' ? 'var(--danger)' : 'var(--text-muted)', borderBottom: activeTab === 'restaurants' ? '3px solid var(--danger)' : 'none' }}>
                    Audit des Restaurants
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    style={{ padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'reports' ? 'var(--danger)' : 'var(--text-muted)', borderBottom: activeTab === 'reports' ? '3px solid var(--danger)' : 'none' }}>
                    Signalements Avis
                </button>
            </div>

            {/* Content Table */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                            {activeTab === 'clients' ? (
                                <tr>
                                    <th style={{ padding: '1.2rem' }}>Profil</th>
                                    <th style={{ padding: '1.2rem' }}>Email & Password</th>
                                    <th style={{ padding: '1.2rem' }}>Dernière Connexion</th>
                                    <th style={{ padding: '1.2rem' }}>Dernière Déconnexion</th>
                                    <th style={{ padding: '1.2rem' }}>Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th style={{ padding: '1.2rem' }}>Établissement</th>
                                    <th style={{ padding: '1.2rem' }}>Cuisine & Prix</th>
                                    <th style={{ padding: '1.2rem' }}>Contact Pro</th>
                                    <th style={{ padding: '1.2rem' }}>Site Web</th>
                                    <th style={{ padding: '1.2rem' }}>Actions</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {activeTab === 'clients' ? (
                                filteredClients.map(client => (
                                    <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                                    {client.name?.[0]}{client.last_name?.[0]}
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
                                        <td style={{ padding: '1.2rem' }}>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}</td>
                                        <td style={{ padding: '1.2rem' }}>{client.email_verified_at ? 'Vérifié' : 'Non vérifié'}</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <button className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '0.5rem' }} onClick={() => toast.info('Action restreinte')}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : activeTab === 'restaurants' ? (
                                filteredRestaurants.map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1.2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <img src={res.image_url} alt={res.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
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
                                        <td style={{ padding: '1.2rem' }}>{res.phone}</td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <a href={res.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                Visiter <ExternalLink size={14} />
                                            </a>
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <button className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '0.5rem' }} onClick={() => toast.info('Action restreinte')}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚩</div>
                                        <h3 style={{ marginBottom: '0.5rem' }}>Gestion des Signalements</h3>
                                        <p style={{ color: 'var(--text-muted)' }}>La liste des avis signalés sera affichée ici après validation.</p>
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
