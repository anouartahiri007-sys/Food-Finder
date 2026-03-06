import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        date_of_birth: '',
        role: 'customer',
        accepted_privacy_policy: false,
        is_over_18: false
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.accepted_privacy_policy || !formData.is_over_18) {
            setError('Vous devez accepter la politique de confidentialité et confirmer que vous avez plus de 18 ans.');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (profilePhoto) {
                data.append('profile_photo', profilePhoto);
            }

            const response = await api.post('/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setRegisteredEmail(formData.email);
            // Instead of redirecting to home, we'll show the verification screen
            // For now, let's just alert or move to a "Verify" state
            navigate('/verify-email', { state: { email: formData.email } });
        } catch (err) {
            if (err.response?.status === 422 && err.response.data.errors) {
                const messages = Object.values(err.response.data.errors).flat();
                setError(messages.join(' '));
            } else {
                setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-form" style={{ maxWidth: '600px' }}>
                <h2 className="auth-title">Créer un compte Food Finder</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label>Prénom</label>
                        <input
                            type="text"
                            className="input-base"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Nom</label>
                        <input
                            type="text"
                            className="input-base"
                            required
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Email</label>
                        <input
                            type="email"
                            className="input-base"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Date de naissance</label>
                        <input
                            type="date"
                            className="input-base"
                            required
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Rôle</label>
                        <select
                            className="input-base"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="customer">Client (Gourmet)</option>
                            <option value="owner">Restaurateur / CEO</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Photo de profil</label>
                        <input
                            type="file"
                            className="input-base"
                            onChange={(e) => setProfilePhoto(e.target.files[0])}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            className="input-base"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmer le mot de passe</label>
                        <input
                            type="password"
                            className="input-base"
                            required
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        />
                    </div>

                    <div className="checkbox-group full-width">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                required
                                checked={formData.is_over_18}
                                onChange={(e) => setFormData({ ...formData, is_over_18: e.target.checked })}
                            />
                            <span>J'ai plus de 18 ans</span>
                        </label>

                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                required
                                checked={formData.accepted_privacy_policy}
                                onChange={(e) => setFormData({ ...formData, accepted_privacy_policy: e.target.checked })}
                            />
                            <span>J'accepte la politique de confidentialité et les cookies</span>
                        </label>
                    </div>

                    <button type="submit" className="btn btn-primary full-width" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Chargement...' : 'S\'inscrire'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                    Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
