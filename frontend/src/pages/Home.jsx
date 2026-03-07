import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Filter, Star, Clock, ChevronDown, X, Loader2 } from 'lucide-react';
import RestaurantMap from '../components/Map/RestaurantMap';
import api from '../api/axios';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const PROXY = 'https://corsproxy.io/?';

// Helper: get Google photo URL or fallback
const getPhotoUrl = (restaurant) => {
    if (restaurant.image_url) return restaurant.image_url;
    if (restaurant.photo_url) return restaurant.photo_url;
    return `https://picsum.photos/seed/${restaurant.id}/400/300`;
};

// Cuisine filter options
const CUISINE_OPTIONS = [
    { label: 'Française', query: 'française' },
    { label: 'Marocaine', query: 'marocaine' },
    { label: 'Italienne', query: 'italienne' },
    { label: 'Japonaise', query: 'japonaise' },
    { label: 'Américaine', query: 'américaine' },
    { label: 'Européenne', query: 'européenne' },
];

// Price level options
const PRICE_OPTIONS = [
    { label: '$', value: 1 },
    { label: '$$', value: 2 },
    { label: '$$$', value: 3 },
    { label: '$$$$', value: 4 },
];

// Rating filter options
const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0];

const Home = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState({ lat: 33.5731, lng: -7.5898 }); // Default: Casablanca

    // Search state (Removed)

    // Filter state
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [priceFilter, setPriceFilter] = useState(null); // null = all
    const [openNow, setOpenNow] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(true);

    const searchTimeoutRef = useRef(null);
    const initialLoadDone = useRef(false);

    // ---- FETCH RESTAURANTS VIA API (MOCK) ----
    const fetchRestaurants = async (options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const {
                query = '',
                cuisines = [],
                priceFilter = null,
                ratingFilter = 0,
            } = options;

            const params = {
                search: query,
                cuisine_type: cuisines.join(','),
                min_rating: ratingFilter
            };

            const response = await api.get('/restaurants', { params });
            const backendData = response.data;

            const results = backendData.map(res => ({
                id: res.id,
                name: res.name,
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude,
                rating: res.rating || 0,
                user_ratings: res.reviews_count || 0,
                price_level: res.price_range === '$' ? 1 : res.price_range === '$$' ? 2 : 3,
                open_now: true,
                types: [res.cuisine_type],
                image_url: res.image_url,
                photo_url: res.image_url,
            }));

            // Filter manually too as mock is simple
            let filtered = results;
            if (cuisines.length > 0) {
                filtered = filtered.filter(r => cuisines.includes(r.types[0]));
            }
            if (priceFilter) {
                filtered = filtered.filter(r => r.price_level === priceFilter);
            }
            if (ratingFilter > 0) {
                filtered = filtered.filter(r => r.rating >= ratingFilter);
            }

            setRestaurants(filtered);
        } catch (err) {
            console.error('Error fetching restaurants:', err);
            setError("Erreur lors de la récupération des restaurants.");
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    // Get user GPS location on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(newLoc);
                    // Fetch with actual user location
                    initialLoadDone.current = true;
                    fetchRestaurants({ location: newLoc });
                },
                () => {
                    // Fallback: use default Casablanca
                    initialLoadDone.current = true;
                    fetchRestaurants({ location: { lat: 33.5731, lng: -7.5898 } });
                }
            );
        } else {
            initialLoadDone.current = true;
            fetchRestaurants({ location: { lat: 33.5731, lng: -7.5898 } });
        }
    }, []);

    // Handle explicit search (Removed)

    // Handle cuisine toggle
    const handleCuisineToggle = (cuisine) => {
        setSelectedCuisines(prev =>
            prev.includes(cuisine)
                ? prev.filter(c => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    // Re-fetch when filters change (debounced)
    useEffect(() => {
        if (!initialLoadDone.current) return;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            fetchRestaurants({
                cuisines: selectedCuisines,
                location: userLocation,
                priceFilter: priceFilter,
                ratingFilter: minRating,
            });
        }, 500);

        return () => clearTimeout(searchTimeoutRef.current);
    }, [selectedCuisines, minRating, priceFilter, openNow]);

    // Clear all filters
    const clearFilters = () => {
        setSelectedCuisines([]);
        setMinRating(0);
        setPriceFilter(null);
        setOpenNow(false);
    };

    const hasActiveFilters = selectedCuisines.length > 0 || minRating > 0 || priceFilter !== null || openNow;

    // Derive popular restaurants (sorted by rating * user_ratings count)
    const popularRestaurants = [...restaurants]
        .filter(r => r.rating >= 4.0)
        .sort((a, b) => (b.rating * b.user_ratings) - (a.rating * a.user_ratings))
        .slice(0, 6);

    // Price level to display string
    const priceDisplay = (level) => {
        if (!level) return '';
        return '€'.repeat(level);
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', padding: '2rem' }}>
            {/* Filters Sidebar */}
            <aside style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem' }}>
                            <Filter size={18} /> Filtres
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {hasActiveFilters && (
                                <button
                                    id="clear-filters-btn"
                                    onClick={clearFilters}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                    <X size={14} /> Effacer
                                </button>
                            )}
                            <button
                                onClick={() => setFiltersOpen(!filtersOpen)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: filtersOpen ? 'rotate(0)' : 'rotate(-90deg)' }}
                            >
                                <ChevronDown size={18} />
                            </button>
                        </div>
                    </div>

                    {filtersOpen && (
                        <>
                            {/* Cuisine Type */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type de cuisine</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {CUISINE_OPTIONS.map(cuisine => (
                                        <button
                                            key={cuisine.label}
                                            onClick={() => handleCuisineToggle(cuisine.label)}
                                            style={{
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: 'var(--radius-full)',
                                                border: `1.5px solid ${selectedCuisines.includes(cuisine.label) ? 'var(--primary)' : 'var(--border-color)'}`,
                                                backgroundColor: selectedCuisines.includes(cuisine.label) ? 'rgba(240,90,40,0.1)' : 'transparent',
                                                color: selectedCuisines.includes(cuisine.label) ? 'var(--primary)' : 'var(--text-main)',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem',
                                                fontWeight: selectedCuisines.includes(cuisine.label) ? '600' : '400',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {cuisine.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note minimale */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Note minimale</h4>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    {RATING_OPTIONS.map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                                            style={{
                                                padding: '0.35rem 0.65rem',
                                                borderRadius: 'var(--radius-full)',
                                                border: `1.5px solid ${minRating === rating ? 'var(--warning)' : 'var(--border-color)'}`,
                                                backgroundColor: minRating === rating ? 'rgba(245,158,11,0.1)' : 'transparent',
                                                color: minRating === rating ? 'var(--warning)' : 'var(--text-main)',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem',
                                                fontWeight: minRating === rating ? '600' : '400',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.2rem',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            <Star size={12} fill={minRating === rating ? 'var(--warning)' : 'none'} /> {rating}+
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prix */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix</h4>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    {PRICE_OPTIONS.map(price => (
                                        <button
                                            key={price.value}
                                            onClick={() => setPriceFilter(priceFilter === price.value ? null : price.value)}
                                            style={{
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: 'var(--radius-full)',
                                                border: `1.5px solid ${priceFilter === price.value ? 'var(--success)' : 'var(--border-color)'}`,
                                                backgroundColor: priceFilter === price.value ? 'rgba(16,185,129,0.1)' : 'transparent',
                                                color: priceFilter === price.value ? 'var(--success)' : 'var(--text-main)',
                                                cursor: 'pointer',
                                                fontSize: '0.82rem',
                                                fontWeight: priceFilter === price.value ? '600' : '400',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {price.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ouvert maintenant */}
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: openNow ? 'rgba(16,185,129,0.1)' : 'transparent',
                                    border: `1.5px solid ${openNow ? 'var(--success)' : 'var(--border-color)'}`,
                                    transition: 'all 0.2s ease',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={openNow}
                                        onChange={() => setOpenNow(!openNow)}
                                        style={{ accentColor: 'var(--success)' }}
                                    />
                                    <Clock size={16} color={openNow ? 'var(--success)' : 'var(--text-muted)'} />
                                    <span style={{ fontSize: '0.85rem', color: openNow ? 'var(--success)' : 'var(--text-main)', fontWeight: openNow ? '600' : '400' }}>
                                        Ouvert maintenant
                                    </span>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* Result count */}
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Recherche en cours...' : `${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''} trouvé${restaurants.length !== 1 ? 's' : ''}`}
                    </span>
                </div>
            </aside>

            {/* Results & Map */}
            <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Map */}
                <div style={{ height: '420px', marginBottom: '2rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                    <RestaurantMap restaurants={restaurants} center={userLocation} />
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--danger)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Popular Restaurants Section */}
                {!loading && popularRestaurants.length > 0 && (
                    <div
                        style={{ marginBottom: '2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Star size={22} color="var(--warning)" fill="var(--warning)" />
                            <h2 style={{ margin: 0 }}>Restaurants populaires</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Les mieux notés</span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '1rem',
                        }}>
                            {popularRestaurants.slice(0, 4).map(restaurant => (
                                <div key={`pop-${restaurant.id}`} className="card" style={{
                                    padding: 0, overflow: 'hidden', cursor: 'pointer',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                >
                                    <div style={{
                                        height: '120px',
                                        backgroundImage: `url(${getPhotoUrl(restaurant)})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        position: 'relative',
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '0.5rem', right: '0.5rem',
                                            backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff',
                                            padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem', fontWeight: '600',
                                            display: 'flex', alignItems: 'center', gap: '0.2rem',
                                        }}>
                                            <Star size={11} fill="#fbbf24" color="#fbbf24" /> {restaurant.rating}
                                        </div>
                                    </div>
                                    <div style={{ padding: '0.75rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant.name}</h4>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {restaurant.address}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Restaurants */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>Tous les restaurants</h2>
                    {hasActiveFilters && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Filtres actifs : {selectedCuisines.join(', ')} {minRating > 0 ? `• ★${minRating}+` : ''} {priceFilter ? `• ${priceDisplay(priceFilter)}` : ''} {openNow ? '• Ouvert' : ''}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                        <p>Recherche des restaurants via Google Maps...</p>
                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : restaurants.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                        <Search size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>Aucun restaurant trouvé</h3>
                        <p>Essayez de modifier vos critères de recherche ou vos filtres.</p>
                        {hasActiveFilters && (
                            <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
                    >
                        {restaurants.map(restaurant => (
                            <div key={restaurant.id} className="card" style={{
                                padding: 0, overflow: 'hidden', cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                            >
                                <div style={{
                                    height: '200px',
                                    backgroundImage: `url(${getPhotoUrl(restaurant)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative',
                                }}>
                                    {/* Rating badge */}
                                    <div style={{
                                        position: 'absolute', top: '0.75rem', right: '0.75rem',
                                        backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                                        color: '#fff', padding: '0.3rem 0.6rem',
                                        borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: '600',
                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    }}>
                                        <Star size={13} fill="#fbbf24" color="#fbbf24" /> {restaurant.rating}
                                    </div>
                                    {/* Price badge */}
                                    {restaurant.price_level && (
                                        <div style={{
                                            position: 'absolute', top: '0.75rem', left: '0.75rem',
                                            backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                                            color: '#10b981', padding: '0.3rem 0.6rem',
                                            borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: '600',
                                        }}>
                                            {priceDisplay(restaurant.price_level)}
                                        </div>
                                    )}
                                    {/* Open now badge */}
                                    {restaurant.open_now === true && (
                                        <div style={{
                                            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
                                            backgroundColor: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(4px)',
                                            color: '#fff', padding: '0.25rem 0.55rem',
                                            borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '600',
                                            display: 'flex', alignItems: 'center', gap: '0.2rem',
                                        }}>
                                            <Clock size={11} /> Ouvert
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '1.25rem' }}>
                                    <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem' }}>{restaurant.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <MapPin size={14} /> {restaurant.address}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                            <Star size={13} fill="var(--warning)" color="var(--warning)" /> {restaurant.rating}
                                        </span>
                                        <span>({restaurant.user_ratings} avis)</span>
                                        {restaurant.price_level && <span style={{ color: 'var(--success)', fontWeight: '600' }}>{priceDisplay(restaurant.price_level)}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
