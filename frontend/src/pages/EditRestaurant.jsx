import { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import { Utensils, MapPin, Phone, Globe, Clock, DollarSign, Image as ImageIcon, Save, ArrowLeft, Coffee } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const EditRestaurant = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

    const dietaryOptionsList = [
        'Végétarien', 'Vegan', 'Sans Gluten', 'Halal', 'Casher', 'Bio', 'Sans Lactose'
    ];

    useEffect(() => {
        const fetchRestaurant = async () => {
            try { 
                const response = await api.get(`/restaurants/${id}`); 
                const data = response.data; 
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    address: data.address || '',
                    cuisine_type: data.cuisine_type || '',
                    price_range: data.price_range || '$$',
                    opening_time: data.opening_time ? data.opening_time.substring(0, 5) : '09:00',
                    closing_time: data.closing_time ? data.closing_time.substring(0, 5) : '22:00',
                    phone: data.phone || '',
                    website: data.website || '', 
                    dietary_options: data.dietary_options || [], 
                }); 
                if (data.image_url) setPreview(data.image_url);
            } catch (error) {
                console.error('Error fetching restaurant', error);
                toast.error('Erreur lors de la récupération des données.');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target; 
        setFormData(prev => ({ ...prev, [name]: value })); 
    }; 

    const handleDietaryToggle = (option) => {
        setFormData(prev => ({
            ...prev,
            dietary_options: prev.dietary_options.includes(option)
                ? prev.dietary_options.filter(item => item !== option)
                : [...prev.dietary_options, option]
        }));
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
        setSaving(true);

        const data = new FormData();
        // Laravel PUT with FormData needs _method='PUT'
        data.append('_method', 'PUT'); 
        Object.keys(formData).forEach(key => { 
            if (key === 'dietary_options') {
                formData[key].forEach(opt => data.append('dietary_options[]', opt));
            } else {
                data.append(key, formData[key]);
            }
        });
        if (image) data.append('image', image);

        try {
            // Using POST with _method=PUT for multipart/form-data support in Laravel
            await api.post(`/restaurants/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }); 
            toast.success("Modifications enregistrées !"); 
            navigate('/dashboard'); 
        } catch (error) {
            console.error('Error updating restaurant', error);
            toast.error('Erreur lors de la mise à jour du restaurant.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}> 
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: '500' }}> 
                <ArrowLeft size={18} /> Retour 
            </button>

            <div className="card">
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Utensils size={28} className="text-primary" /> Modifier l'Établissement
                </h1>

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group full-width">
                        <label>Nom du restaurant *</label>
                        <input type="text" name="name" className="input-base" required value={formData.name} onChange={handleChange} /> 
                    </div> 
 
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea name="description" className="input-base" rows="4" value={formData.description} onChange={handleChange} style={{ resize: 'vertical' }}></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label>Adresse complète *</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /> 
                            <input type="text" name="address" className="input-base" required value={formData.address} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} /> 
                        </div> 
                    </div>

                    <div className="form-group">
                        <label>Type de cuisine *</label>
                        <input type="text" name="cuisine_type" className="input-base" required value={formData.cuisine_type} onChange={handleChange} />
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
                        <input type="tel" name="phone" className="input-base" value={formData.phone} onChange={handleChange} /> 
                    </div>

                    <div className="form-group">
                        <label><Globe size={16} /> Site Web</label>
                        <input type="url" name="website" className="input-base" value={formData.website} onChange={handleChange} />
                    </div>

                    {/* Dietary Options */}
                    <div className="form-group full-width">
                        <label><Coffee size={18} /> Options alimentaires</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {dietaryOptionsList.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleDietaryToggle(option)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-full)',
                                        border: formData.dietary_options.includes(option) ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                        background: formData.dietary_options.includes(option) ? 'var(--primary)' : 'transparent',
                                        color: formData.dietary_options.includes(option) ? 'white' : 'var(--text-main)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label><ImageIcon size={18} /> Photo de l'établissement</label> 
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => document.getElementById('image-upload').click()}> 
                            {preview ? ( 
                                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                            ) : (
                                <div>
                                    <ImageIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                                    <p style={{ color: 'var(--text-muted)' }}>Cliquez pour modifier la photo</p>
                                </div>
                            )}
                            <input id="image-upload" type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </div> 
                    </div> 
 
                    <button type="submit" className="btn btn-primary full-width" disabled={saving} style={{ marginTop: '1.5rem', height: '50px' }}>
                        {saving ? <div className="loader" style={{ width: '20px', height: '20px', borderSize: '3px' }}></div> : <><Save size={20} /> Enregistrer les modifications</>}
                    </button>
                </form>
            </div>
        </div>
    );
};
 
export default EditRestaurant;
