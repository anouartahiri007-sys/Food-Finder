import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
        gender: '',
        role: 'customer',
        accepted_privacy_policy: false,
        website: '',
        phone: ''
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 18+ Verification
        if (!formData.date_of_birth) {
            toast.error('La date de naissance est requise.');
            setLoading(false);
            return;
        }
        const birthDate = new Date(formData.date_of_birth);
        if (isNaN(birthDate.getTime())) {
            toast.error('Date de naissance invalide.');
            setLoading(false);
            return;
        }
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            toast.error('Vous devez avoir au moins 18 ans pour vous inscrire.');
            setLoading(false);
            return;
        }

        if (!formData.accepted_privacy_policy) {
            toast.error('Vous devez accepter la politique de confidentialité.');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                // Convert boolean to string for FormData compatibility
                if (typeof formData[key] === 'boolean') {
                    data.append(key, formData[key] ? '1' : '0');
                } else {
                    data.append(key, formData[key]);
                }
            });
            if (profilePhoto) {
                data.append('profile_photo', profilePhoto);
            }

            await api.post('/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Inscription validée !");
            navigate('/verify-email', { state: { email: formData.email } });
        } catch (err) {
            if (err.response?.status === 422 && err.response.data.errors) {
                const messages = Object.values(err.response.data.errors).flat();
                toast.error(messages.join(' '));
            } else {
                toast.error(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-form" style={{ maxWidth: '700px' }}>
                <h2 className="auth-title">Créer un compte Food Finder</h2>

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

                    <div className="form-group">
                        <label>Genre</label>
                        <select
                            className="input-base"
                            required
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <option value="">Sélectionner</option>
                            <option value="Male">Homme</option>
                            <option value="Female">Femme</option>
                        </select>
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

                    <div className="form-group full-width">
                        <label>Rôle</label>
                        <select
                            className="input-base"
                            value={formData.role ?? 'customer'}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="customer">Client (Gourmet)</option>
                            <option value="owner">Restaurateur / CEO</option>
                        </select>
                    </div>

                    {formData.role === 'owner' && (
                        <>
                            <div className="form-group">
                                <label>Numéro de téléphone</label>
                                <input
                                    type="tel"
                                    className="input-base"
                                    required
                                    placeholder="+212 ..."
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Lien du site web</label>
                                <input
                                    type="url"
                                    className="input-base"
                                    required
                                    placeholder="https://..."
                                    value={formData.website || ''}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </>
                    )}

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

                    <div className="form-group full-width">
                        <label>Photo de profil</label>
                        <input
                            type="file"
                            className="input-base"
                            onChange={(e) => setProfilePhoto(e.target.files[0])}
                        />
                    </div>

                    <div className="checkbox-group full-width">
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
