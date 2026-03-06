import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Require CSRF cookie first for Sanctum authentication
            await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });

            const response = await api.post('/login', formData);
            localStorage.setItem('token', response.data.access_token);

            // Force redirect to reload app state with user data
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-form">
                <h2 className="auth-title">Connexion</h2>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                        <input
                            type="email"
                            className="input-base"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mot de passe</label>
                        <input
                            type="password"
                            className="input-base"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
                        {loading ? 'Chargement...' : 'Se connecter'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                    Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
