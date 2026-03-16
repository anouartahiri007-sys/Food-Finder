import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Utensils, MapPin, Phone, Globe, Clock, DollarSign, Image as ImageIcon, Save, ArrowLeft, Coffee, X, Plus } from 'lucide-react'; 
import { toast } from 'react-toastify'; 
import api from '../api/axios';

const AddRestaurant = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        cuisine_type: '',
        price_range: '$',
        opening_time: '09:00',
        closing_time: '22:00',
        phone: '',
        website: '',
        dietary_options: [],
    });
    const [images, setImages] = useState([]);

    // Dietary options available
    const dietaryOptionsList = [
        'Végétarien', 'Vegan', 'Sans Gluten', 'Halal', 'Casher', 'Bio', 'Sans Lactose'
    ];

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
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Add new files to existing ones
            const newImages = [...images, ...files];
            setImages(newImages);
            
            // Generate previews for new files
            const newPreviews = files.map(file => ({
                file,
                url: URL.createObjectURL(file)
            }));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setImages(newImages);
        setPreviews(newPreviews);
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
        // Append multiple images
        images.forEach((img, index) => {
            data.append(`images[${index}]`, img);
        });

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
                        <label><ImageIcon size={18} /> Photos de l'établissement</label>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            Vous pouvez ajouter plusieurs photos pour votre établissement
                        </p>
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                            {/* Preview Grid */}
                            {previews.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                    {previews.map((preview, index) => (
                                        <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                                            <img 
                                                src={preview.url} 
                                                alt={`Preview ${index + 1}`} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    background: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Upload Button */}
                            <label 
                                htmlFor="multiple-image-upload"
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    cursor: 'pointer', 
                                    padding: '1.5rem',
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    transition: 'var(--transition)',
                                    background: 'var(--bg-secondary)'
                                }}
                            >
                                <Plus size={32} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Ajouter des photos
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    PNG, JPG jusqu'à 5MB
                                </span>
                                <input 
                                    id="multiple-image-upload" 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                    hidden 
                                />
                            </label>
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