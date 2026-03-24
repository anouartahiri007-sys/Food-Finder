import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, Globe, Star, Utensils, ArrowLeft, Send, ChevronLeft, ChevronRight, Flag, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import ReservationModal from '../components/Reservations/ReservationModal';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace('/api', '');

// Default placeholder image
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

// Helper to get full image URL
const getFullImageUrl = (url) => {
    if (!url) return DEFAULT_IMAGE;
    if (url.startsWith('http')) return url;
    const prefix = url.startsWith('/') ? '' : '/';
    return `${API_BASE_URL}${prefix}${url}`;
};

const RestaurantDetail = () => {
    const { t } = useTranslation();
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
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isRestaurantOwner = currentUser?.role === 'owner' && restaurant?.user_id === currentUser?.id;

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await api.get(`/restaurants/${id}`);
                setRestaurant(response.data);
            } catch (err) {
                setError(t('restaurant.load_error', 'Impossible de charger les détails du restaurant.'));
                toast.error(t('common.load_error', 'Erreur de chargement'));
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
                toast.error(t('auth.login_required', 'Veuillez vous connecter pour laisser un avis'));
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

    // Placeholder for dynamic reviews - functionality removed
    const handleGenerateDynamicReviews = async () => {
        // This function is kept as placeholder but does nothing
        // Dynamic reviews feature has been removed
    };

    // Handle report submission
    const handleReportSubmit = async () => {
        if (!reportReason.trim()) {
            toast.error('Veuillez sélectionner une raison');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error(t('auth.login_required', 'Veuillez vous connecter pour signaler un avis'));
                setShowReportModal(false);
                return;
            }

            const response = await api.post(`/reviews/${selectedReviewId}/report`, { 
                reason: reportReason 
            });
            
            if (response.data.user_blocked) {
                toast.error('Votre compte a été bloqué pour non-respect des règles de notre site.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => navigate('/login'), 2000);
            } else if (response.data.review_deleted) {
                toast.success(t('restaurant.review_deleted', 'Commentaire signalé et supprimé pour contenu inapproprié.'));
                const response = await api.get(`/restaurants/${id}`);
                setRestaurant(response.data);
            } else {
                toast.success(t('restaurant.review_reported', 'Avis signalé ! Merci pour votre vigilance.'));
            }
            
            setShowReportModal(false);
            setReportReason('');
            setSelectedReviewId(null);
        } catch (err) {
            if (err.response?.data?.user_blocked) {
                toast.error('Votre compte a été bloqué pour non-respect des règles de notre site.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(err.response?.data?.message || 'Erreur lors du signalement');
            }
        }
    };

    // Open report modal
    const openReportModal = (reviewId) => {
        setSelectedReviewId(reviewId);
        setShowReportModal(true);
    };

    // Delete review (owner or self)
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Supprimer cet avis ?')) return;
        
        try {
            await api.delete(`/reviews/${reviewId}`);
            const response = await api.get(`/restaurants/${id}`);
            setRestaurant(response.data);
            toast.success('Avis supprimé.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la suppression.');
        }
    };

    // Get real reviews from API
    const getDisplayReviews = () => {
        if (!restaurant) return [];
        return restaurant.reviews || [];
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
                            <Link to={`/restaurants/${id}/menu`} className="btn btn-secondary full_width">Voir le menu complet</Link>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <h3>Avis des clients</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                    >
                                        <Star size={16} style={{ marginRight: '0.3rem' }} />
                                        {showReviewForm ? 'Annuler' : 'Laisser un avis'}
                                    </button>
                                </div>
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
                                    displayReviews.map((review, index) => {
                                        const isOwner = currentUser && review.user_id === currentUser.id;
                                        return (
                                            <div key={`review-${review.id || index}`} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                                                            {(review.user?.name || 'A')[0].toUpperCase()}
                                                        </div>
                                                        <strong>{review.user?.name || 'Anonyme'}</strong>
                                                    </div>
                                                    <div style={{ color: '#f59e0b', fontSize: '0.9rem', letterSpacing: '2px' }}>
                                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                    </div>
                                                </div>
                                                <p style={{ margin: '0.75rem 0 0.5rem', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-main)' }}>{review.comment}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                                    <button
                                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                        onClick={() => openReportModal(review.id)}
                                                    >
                                                        <Flag size={14} /> Signaler
                                                    </button>
                                                    {(isOwner || isRestaurantOwner) && (
                                                        <button
                                                            style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', padding: '0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                            onClick={() => handleDeleteReview(review.id)}
                                                        >
                                                            <Trash2 size={14} /> Supprimer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
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

            {/* Report Modal */}
            {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Signaler ce commentaire</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Pourquoi signalez-vous ce commentaire ?
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {[
                                    'Contenu inapproprié',
                                    'Langage offensant',
                                    'Spam ou publicité',
                                    'Information fausse',
                                    'Autre raison'
                                ].map((reason) => (
                                    <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input 
                                            type="radio" 
                                            name="reportReason" 
                                            value={reason}
                                            checked={reportReason === reason}
                                            onChange={(e) => setReportReason(e.target.value)}
                                        />
                                        {reason}
                                    </label>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowReportModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    Annuler
                                </button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleReportSubmit}
                                    style={{ flex: 1 }}
                                >
                                    Signaler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDetail;
