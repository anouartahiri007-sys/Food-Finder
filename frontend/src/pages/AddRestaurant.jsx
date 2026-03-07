import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, MapPin, Phone, Globe, Clock, DollarSign, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';


const AddRestaurant = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        cuisine_type: '',
        price_range: '$$',
        opening_time: '09:00',
        closing_time: '22:00',
        phone: '',
        website: '',
        dietary_options: [],
    });
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'dietary_options') {
                formData[key].forEach(opt => data.append('dietary_options[]', opt));
            } else {
                data.append(key, formData[key]);
            }
        });
        if (image) data.append('image', image);

        try {
            await api.post('/restaurants', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Établissement ajouté avec succès !");
            navigate('/dashboard');
        } catch (error) {
            console.error('Error adding restaurant', error);
            toast.error('Erreur lors de l\'ajout du restaurant. Veuillez vérifier les champs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '500' }}>
                <ArrowLeft size={18} /> Retour
            </button>

            <div className="card">
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Utensils size={28} className="text-primary" /> Nouvel Établissement
                </h1>

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group full-width">
                        <label>Nom du restaurant *</label>
                        <input type="text" name="name" className="input-base" required value={formData.name} onChange={handleChange} placeholder="Ex: Le Petit Bistro" />
                    </div>

                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea name="description" className="input-base" rows="4" value={formData.description} onChange={handleChange} placeholder="Décrivez votre établissement en quelques mots..." style={{ resize: 'vertical' }}></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label>Adresse complète *</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" name="address" className="input-base" required value={formData.address} onChange={handleChange} placeholder="123 Rue de la Gastronomie, Ville" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Type de cuisine *</label>
                        <input type="text" name="cuisine_type" className="input-base" required value={formData.cuisine_type} onChange={handleChange} placeholder="Ex: Italienne, Vegan, Sushi" />
                    </div>

                    <div className="form-group">
                        <label>Gamme de prix *</label>
                        <select name="price_range" className="input-base" value={formData.price_range} onChange={handleChange}>
                            <option value="$">$ (Économique)</option>
                            <option value="$$">$$ (Moyen)</option>
                            <option value="$$$">$$$ (Haut de gamme)</option>
                            <option value="$$$$">$$$$ (Luxe)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label><Clock size={16} /> Heure d'ouverture</label>
                        <input type="time" name="opening_time" className="input-base" value={formData.opening_time} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label><Clock size={16} /> Heure de fermeture</label>
                        <input type="time" name="closing_time" className="input-base" value={formData.closing_time} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label><Phone size={16} /> Téléphone</label>
                        <input type="tel" name="phone" className="input-base" value={formData.phone} onChange={handleChange} placeholder="+33 1 23 45 67 89" />
                    </div>

                    <div className="form-group">
                        <label><Globe size={16} /> Site Web</label>
                        <input type="url" name="website" className="input-base" value={formData.website} onChange={handleChange} placeholder="https://www.exemple.com" />
                    </div>

                    <div className="form-group full-width">
                        <label><ImageIcon size={18} /> Photo de l'établissement</label>
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => document.getElementById('image-upload').click()}>
                            {preview ? (
                                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                            ) : (
                                <div>
                                    <ImageIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                                    <p style={{ color: 'var(--text-muted)' }}>Cliquez pour ajouter une photo</p>
                                </div>
                            )}
                            <input id="image-upload" type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary full-width" disabled={loading} style={{ marginTop: '1.5rem', height: '50px' }}>
                        {loading ? <div className="loader" style={{ width: '20px', height: '20px', borderSize: '3px' }}></div> : <><Save size={20} /> Enregistrer l'établissement</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRestaurant;
