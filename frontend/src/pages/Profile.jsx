import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Camera, Save, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        description: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, resRes] = await Promise.all([
                    api.get('/profile'),
                    api.get('/reservations')
                ]);
                setUser(userRes.data);
                setReservations(resRes.data);
                setFormData({
                    name: userRes.data.name || '',
                    last_name: userRes.data.last_name || '',
                    phone: userRes.data.phone || '',
                    date_of_birth: userRes.data.date_of_birth || '',
                    description: userRes.data.description || ''
                });

                if (userRes.data.profile_photo) {
                    setPhotoPreview(userRes.data.profile_photo);
                }
            } catch (err) {
                console.error('Error fetching profile data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('last_name', formData.last_name);
            data.append('phone', formData.phone);
            data.append('date_of_birth', formData.date_of_birth);
            data.append('description', formData.description);
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

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    return (
        <div className="profile-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="detail-grid">
                {/* Profile Edit Section */}
                <div className="card">
                    <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Mon Profil</h2>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={photoPreview || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random&size=100`}
                                    alt="Profile"
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                                />
                                <label
                                    htmlFor="photo-upload"
                                    style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: 'var(--primary)', color: 'white', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}
                                >
                                    <Camera size={16} />
                                </label>
                                <input id="photo-upload" type="file" hidden onChange={handlePhotoChange} accept="image/*" />
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.2rem' }}>{user.name} {user.last_name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.role === 'owner' ? 'Restaurateur' : 'Gourmet'}</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Prénom</label>
                                <input
                                    type="text"
                                    className="input-base"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nom</label>
                                <input
                                    type="text"
                                    className="input-base"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Téléphone</label>
                                <input
                                    type="text"
                                    className="input-base"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+212 ..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Date de naissance</label>
                                <input
                                    type="date"
                                    className="input-base"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Bio / Description</label>
                                <textarea
                                    className="input-base"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Parlez-nous un peu de vous..."
                                ></textarea>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={saving}>
                            <Save size={18} /> {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                        </button>
                    </form>
                </div>

                {/* Account Settings / Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Infos Compte</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-muted)' }}>
                                <Mail size={18} /> {user.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-muted)' }}>
                                <Calendar size={18} /> Membre depuis {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Mes Favoris</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                <img src="https://picsum.photos/seed/1/200/100" alt="Fav" style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                                <div style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}>Sushi Zen</div>
                            </div>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                <img src="https://picsum.photos/seed/4/200/100" alt="Fav" style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                                <div style={{ padding: '0.5rem', fontSize: '0.8rem', fontWeight: '600' }}>Al Mounia</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Historique Réservations</h3>
                        {reservations.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aucune réservation trouvée.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reservations.slice(0, 3).map(res => (
                                    <div key={res.id} style={{ padding: '0.8rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.3rem' }}>{res.restaurant.name}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                            <span>{new Date(res.reservation_date).toLocaleDateString()}</span>
                                            <span style={{
                                                color: res.status === 'confirmed' ? '#10b981' : res.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                                                textTransform: 'capitalize'
                                            }}>
                                                {res.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
