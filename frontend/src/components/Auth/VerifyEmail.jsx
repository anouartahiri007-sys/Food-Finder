import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const email = location.state?.email || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/verify-email', { email, code });
            localStorage.setItem('token', response.data.access_token);
            // Force reload to update app state
            window.location.href = '/';
        } catch (err) {
            setError(err.response?.data?.message || 'Code invalide ou expiré');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-form" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h2 className="auth-title">Vérification de l'email</h2>
                <p className="auth-subtitle">
                    Nous avons envoyé un code de vérification à <strong>{email}</strong>. Veuillez le saisir ci-dessous.
                </p>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                    💡 <strong>Mode Développeur:</strong> Utilisez le code <code>000000</code> ou consultez <code>backend/storage/logs/laravel.log</code>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="input-base"
                            placeholder="Code à 6 chiffres"
                            maxLength="6"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary full-width" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Vérification...' : 'Vérifier'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
