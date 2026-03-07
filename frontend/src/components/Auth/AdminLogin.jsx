import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Lock, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            if (response.data.user.role === 'admin') {
                localStorage.setItem('token', response.data.token);
                toast.success("Bienvenue dans l'espace Administration.");
                // Force reload to update App state
                window.location.href = '/admin/dashboard';
            } else {
                toast.error('Accès refusé. Seuls les administrateurs peuvent se connecter ici.');
                localStorage.removeItem('token');
            }
        } catch (err) {
            toast.error('Identifiants admin incorrects.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card auth-form" style={{ maxWidth: '450px', width: '100%', borderTop: '4px solid var(--danger)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <ShieldAlert size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Connexion Administration</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Espace réservé au personnel autorisé.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Email Professionnel</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="input-base"
                                required
                                style={{ paddingLeft: '40px' }}
                                placeholder="admin@foodfinder.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Mot de passe</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="input-base"
                                required
                                style={{ paddingLeft: '40px' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        {loading ? 'Connexion...' : <><LogIn size={18} /> Accéder au SaaS Admin</>}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <p>En cas d'oubli de vos accès, contactez le support technique.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
