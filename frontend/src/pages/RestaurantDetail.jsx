import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, Globe, Star, Utensils, ArrowLeft, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import ReservationModal from '../components/Reservations/ReservationModal';

// Default placeholder image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');

// Helper to get full image URL
const getFullImageUrl = (url) => {
    if (!url) return DEFAULT_IMAGE;
    if (url.startsWith('http')) return url;
    const prefix = url.startsWith('/') ? '' : '/';
    return `${API_BASE_URL}${prefix}${url}`;
};

// Fake reviews data
const FAKE_REVIEWS = [
    {
        id: 1,
        user: { name: 'Ahmed B.' },
        rating: 5,
        comment: 'Excellent restaurant ! La cuisine est délicieuse et le service est impeccable. Je recommande fortement le tajine royal.'
    },
    {
        id: 2,
        user: { name: 'Sara L.' },
        rating: 4,
        comment: 'Très bon endroit pour manger en famille. L\'ambiance est chaleureuse et les prix sont raisonnable. Le couscous est excellent.'
    },
    {
        id: 3,
        user: { name: 'Mohamed R.' },
        rating: 5,
        comment: 'Une expérience culinaire exceptionnelle. Le poisson grillé était parfaitement préparé. Personnel très accueillant.'
    },
    {
        id: 4,
        user: { name: 'Fatima E.' },
        rating: 4,
        comment: 'Bel endroit, propres et bien situé. Les pâtisseries marocaines sont à tester absolument !'
    },
    {
        id: 5,
        user: { name: 'Youssef K.' },
        rating: 5,
        comment: 'Mon restaurant préféré à Casablanca ! La qualité des ingrédients est remarquable. Réservation recommandée le weekend.'
    }
];

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [reservationSuccess, setReservationSuccess] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await api.get(`/restaurants/${id}`);
                setRestaurant(response.data);
            } catch (err) {
                setError('Impossible de charger les détails du restaurant.');
                toast.error('Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    // Get all images for carousel
    const getAllImages = () => {
        if (!restaurant) return [DEFAULT_IMAGE];
        const images = [];
        if (restaurant.image_url) images.push(getFullImageUrl(restaurant.image_url));
        if (restaurant.photos && restaurant.photos.length > 0) {
            restaurant.photos.forEach(photo => images.push(getFullImageUrl(photo.url)));
        }
        return images.length > 0 ? images : [DEFAULT_IMAGE];
    };

    const allImages = restaurant ? getAllImages() : [DEFAULT_IMAGE];

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
        setImageError(false);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
        setImageError(false);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Veuillez vous connecter pour laisser un avis');
                setSubmittingReview(false);
                return;
            }
            
            await api.post(`/restaurants/${id}/reviews`, reviewData);
            toast.success('Avis ajouté avec succès !');
            setShowReviewForm(false);
            setReviewData({ rating: 5, comment: '' });
            const response = await api.get(`/restaurants/${id}`);
            setRestaurant(response.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la soumission de l\'avis');
        } finally {
            setSubmittingReview(false);
        }
    };

    // Combine real reviews with fake reviews
    const getDisplayReviews = () => {
        if (!restaurant) return FAKE_REVIEWS;
        const realReviews = restaurant.reviews || [];
        return [...realReviews, ...FAKE_REVIEWS].slice(0, 5);
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!restaurant) return <div>Restaurant non trouvé.</div>;

    const displayReviews = getDisplayReviews();

    return (
        <div className="restaurant-detail">
            {/* Hero Section with Image Carousel */}
            <div className="detail-header" style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${imageError ? DEFAULT_IMAGE : getFullImageUrl(allImages[currentImageIndex])})`,
                minHeight: '400px',
                position: 'relative'
            }}>
                {/* Carousel Controls */}
                {allImages.length > 1 && (
                    <>
                        <button 
                            onClick={handlePrevImage}
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.9)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '48px',
                                height: '48px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s ease',
                                zIndex: 10
                            }}
                        >
                            <ChevronLeft size={24} color="#333" />
                        </button>
                        <button 
                            onClick={handleNextImage}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.9)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '48px',
                                height: '48px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                transition: 'all 0.3s ease',
                                zIndex: 10
                            }}
                        >
                            <ChevronRight size={24} color="#333" />
                        </button>
                        {/* Dots Indicators */}
                        <div style={{
                            position: 'absolute',
                            bottom: '100px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '0.5rem',
                            zIndex: 10
                        }}>
                            {allImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentImageIndex(index);
                                        setImageError(false);
                                    }}
                                    style={{
                                        width: index === currentImageIndex ? '24px' : '10px',
                                        height: '10px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        background: index === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
                
                {/* Back Button - positioned at top left of hero */}
                <button 
                    onClick={() => navigate(-1)}
                    aria-label="Retour à la recherche"
                    style={{
                        position: 'absolute',
                        top: '24px',
                        left: '24px',
                        zIndex: 20,
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '50px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.3s ease',
                        textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    }}
                >
                    <ChevronLeft size={20} /> Retour
                </button>

                <div className="container" style={{ position: 'relative', zIndex: 5, paddingTop: '60px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{restaurant.name}</h1>
                    <div className="badges" style={{ gap: '0.75rem' }}>
                        <span className="badge badge-primary">{restaurant.cuisine_type}</span>
                        <span className="badge badge-secondary">{restaurant.price_range}</span>
                        <span className="badge badge-success">
                            <Star size={14} fill="currentColor" /> 
                            {restaurant.rating ? parseFloat(restaurant.rating).toFixed(1) : 'Nouveau'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="detail-content container">
                <div className="detail-grid">
                    <div className="main-info card">
                        <section>
                            <h3>À propos</h3>
                            <p>{restaurant.description || "Pas de description disponible pour le moment."}</p>
                        </section>

                        <section className="info-list">
                            <div className="info-item">
                                <MapPin size={20} className="text-primary" />
                                <div>
                                    <h4>Adresse</h4>
                                    <p>{restaurant.address}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <Clock size={20} className="text-primary" />
                                <div>
                                    <h4>Horaires</h4>
                                    <p>{restaurant.opening_time ? `${restaurant.opening_time} - ${restaurant.closing_time}` : 'Non spécifié'}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <Phone size={20} className="text-primary" />
                                <div>
                                    <h4>Téléphone</h4>
                                    <p>{restaurant.phone || 'Non spécifié'}</p>
                                </div>
                            </div>
                            {restaurant.website && (
                                <div className="info-item">
                                    <Globe size={20} className="text-primary" />
                                    <div>
                                        <h4>Site Web</h4>
                                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer">{restaurant.website}</a>
                                    </div>
                                </div>
                            )}
                        </section>

                        <button className="btn btn-primary reservation-btn" onClick={() => setShowModal(true)} style={{ marginTop: '1.5rem' }}>
                            <Utensils size={20} /> Réserver une table
                        </button>

                        {reservationSuccess && (
                            <div className="alert alert-success mt-1">
                                Votre réservation a été envoyée avec succès !
                            </div>
                        )}
                    </div>

                    <div className="side-content">
                        <div className="card menu-preview">
                            <h3>Menu</h3>
                            <p>Venez découvrir nos spécialités faites maison.</p>
                            <Link to={`/restaurants/${id}/menu`} className="btn btn-secondary full-width">Voir le menu complet</Link>
                        </div>

                        <div className="card map-preview">
                            <h3>Horaires d'ouverture</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {restaurant.working_hours?.length > 0 ? (
                                    restaurant.working_hours.map(wh => (
                                        <div key={wh.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ textTransform: 'capitalize' }}>{wh.day}</span>
                                            <span>{wh.is_closed ? 'Fermé' : `${wh.open_time} - ${wh.close_time}`}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Non renseignés.</p>
                                )}
                            </div>
                        </div>

                        <section style={{ marginTop: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Avis des clients</h3>
                                <button 
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                >
                                    <Star size={16} style={{ marginRight: '0.3rem' }} />
                                    {showReviewForm ? 'Annuler' : 'Laisser un avis'}
                                </button>
                            </div>

                            {/* Review Form */}
                            {showReviewForm && (
                                <form onSubmit={handleSubmitReview} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '2px solid var(--primary)' }}>
                                    <h4 style={{ marginBottom: '1rem' }}>Votre avis</h4>
                                    
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Note</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                    style={{ 
                                                        background: 'none', 
                                                        border: 'none', 
                                                        cursor: 'pointer',
                                                        padding: '0.25rem'
                                                    }}
                                                >
                                                    <Star 
                                                        size={28} 
                                                        fill={star <= reviewData.rating ? '#f59e0b' : 'none'}
                                                        color={star <= reviewData.rating ? '#f59e0b' : '#d1d5db'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Commentaire</label>
                                        <textarea
                                            value={reviewData.comment}
                                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                            className="input-base"
                                            rows="4"
                                            placeholder="Partagez votre expérience..."
                                            required
                                        />
                                    </div>
                                    
                                    <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                                        <Send size={16} style={{ marginRight: '0.5rem' }} />
                                        {submittingReview ? 'Envoi...' : 'Soumettre mon avis'}
                                    </button>
                                </form>
                            )}

                            {/* Reviews List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                {displayReviews.length > 0 ? (
                                    displayReviews.map((review, index) => (
                                        <div key={`review-${review.id || index}-${index}`} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong>{review.user?.name || 'Anonyme'}</strong>
                                                <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                                                    {Array(review.rating).fill('★').join('')}
                                                </div>
                                            </div>
                                            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', lineHeight: '1.5' }}>{review.comment}</p>
                                            <button 
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: '0', textAlign: 'left' }}
                                                onClick={() => toast.info('Avis signalé ! Merci pour votre vigilance.')}
                                            >
                                                Signaler cet avis
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>Aucun avis pour le moment. Soyez le premier !</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {showModal && (
                <ReservationModal
                    restaurant={restaurant}
                    onClose={() => setShowModal(false)}
                    onReserved={() => {
                        setReservationSuccess(true);
                        setTimeout(() => setReservationSuccess(false), 5000);
                    }}
                />
            )}
        </div>
    );
};

export default RestaurantDetail;
