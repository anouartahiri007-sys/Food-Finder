import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Globe, Star, Utensils, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import ReservationModal from '../components/Reservations/ReservationModal';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [reservationSuccess, setReservationSuccess] = useState(false);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await api.get(`/restaurants/${id}`);
                setRestaurant(response.data);
            } catch (err) {
                setError('Impossible de charger les détails du restaurant.');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!restaurant) return <div>Restaurant non trouvé.</div>;

    return (
        <div className="restaurant-detail">
            <div className="detail-header" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${restaurant.image_url || restaurant.photo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'})` }}>
                <div className="container">
                    <Link to="/" className="back-link"><ArrowLeft size={20} /> Retour à la recherche</Link>
                    <h1>{restaurant.name}</h1>
                    <div className="badges">
                        <span className="badge badge-primary">{restaurant.cuisine_type}</span>
                        <span className="badge badge-secondary">{restaurant.price_range}</span>
                        <span className="badge badge-success"><Star size={14} fill="currentColor" /> {restaurant.rating || 'Nouveau'}</span>
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

                        <button className="btn btn-primary reservation-btn" onClick={() => setShowModal(true)}>
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
                            <h3>Avis des clients</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                {restaurant.reviews?.length > 0 ? (
                                    restaurant.reviews.map(review => (
                                        <div key={review.id} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>{review.user?.name || 'Anonyme'}</strong>
                                                <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                                                    {Array(review.rating).fill('★').join('')}
                                                </div>
                                            </div>
                                            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{review.comment}</p>
                                            <button 
                                                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', padding: '0', textAlign: 'left' }}
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
