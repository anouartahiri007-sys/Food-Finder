import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MapPin, Filter, Star, Clock, ChevronDown, X, Loader2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RestaurantMap from '../components/Map/RestaurantMap';
import api from '../api/axios';

// Helper: get Google photo URL or fallback
const getPhotoUrl = (restaurant) => {
    if (restaurant.image_url) return restaurant.image_url;
    if (restaurant.photo_url) return restaurant.photo_url;
    return `https://picsum.photos/seed/${restaurant.id}/400/300`;
};

// Cuisine filter options (Translatable)
const getCuisineOptions = (t) => [
    { label: t('cuisines.french', 'Française'), query: 'française' },
    { label: t('cuisines.moroccan', 'Marocaine'), query: 'marocaine' },
    { label: t('cuisines.italian', 'Italienne'), query: 'italienne' },
    { label: t('cuisines.japanese', 'Japonaise'), query: 'japonaise' },
    { label: t('cuisines.american', 'Américaine'), query: 'américaine' },
    { label: t('cuisines.european', 'Européenne'), query: 'européenne' },
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

const SkeletonCard = () => (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: '200px', backgroundColor: 'var(--border-color)', position: 'relative', overflow: 'hidden' }}>
            <div className="skeleton-shimmer" />
        </div>
        <div style={{ padding: '1.25rem' }}>
            <div style={{ height: '20px', width: '70%', background: 'var(--border-color)', marginBottom: '0.75rem', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                <div className="skeleton-shimmer" />
            </div>
            <div style={{ height: '14px', width: '40%', background: 'var(--border-color)', marginBottom: '1rem', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                <div className="skeleton-shimmer" />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ height: '14px', width: '20%', background: 'var(--border-color)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                    <div className="skeleton-shimmer" />
                </div>
                <div style={{ height: '14px', width: '20%', background: 'var(--border-color)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                    <div className="skeleton-shimmer" />
                </div>
            </div>
        </div>
    </div>
);

const RestaurantCard = ({ restaurant, isFavorite, onToggleFavorite, isHighlighted, onInteraction, style = {} }) => {
    const { t } = useTranslation();
    const priceDisplay = (level) => '€'.repeat(level || 1);
    
    return (
        <div 
            className={`card restaurant-card ${isHighlighted ? 'highlighted' : ''}`} 
            style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', ...style }}
            onClick={() => onInteraction && onInteraction()}
        >
            <div style={{ height: '200px', backgroundImage: `url(${getPhotoUrl(restaurant)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <button 
                    className="favorite-btn"
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    style={{ color: isFavorite ? 'var(--danger)' : 'var(--text-muted)' }}
                >
                    <Star size={18} fill={isFavorite ? 'var(--danger)' : 'none'} color={isFavorite ? 'var(--danger)' : 'currentColor'} />
                </button>
                <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={13} fill="#fbbf24" color="#fbbf24" /> {restaurant.rating}
                </div>
                {restaurant.open_now && (
                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: 'rgba(16,185,129,0.9)', color: '#fff', padding: '0.25rem 0.55rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {t('common.open_now', 'OUVERT')}
                    </div>
                )}
            </div>
            <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{restaurant.name}</h3>
                    <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.9rem' }}>{priceDisplay(restaurant.price_level)}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> {restaurant.address}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <a href={`/restaurants/${restaurant.id}`} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>
                        {t('common.view_details', 'Détails')}
                    </a>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem', background: 'transparent' }}>
                        <MapPin size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    const { t } = useTranslation();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState({ lat: 33.5731, lng: -7.5898 }); // Default: Casablanca

    // Filter state
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [priceFilter, setPriceFilter] = useState(null); // null = all
    const [openNow, setOpenNow] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('food_finder_favorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [highlightedId, setHighlightedId] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const searchTimeoutRef = useRef(null);
    const initialLoadDone = useRef(false);
    const suggestionRef = useRef(null);

    const CUISINE_OPTIONS = getCuisineOptions(t);

    // ---- FETCH RESTAURANTS VIA API (MOCK) ----
    const [recommendations, setRecommendations] = useState([]);

    // ---- FETCH RECOMMENDATIONS ----
    const fetchRecommendations = async () => {
        const token = localStorage.getItem('token');
        if (!token) return; // Don't fetch if not logged in

        try {
            const response = await api.get('/recommendations');
            setRecommendations(response.data);
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error('Error fetching recommendations:', err);
            }
        }
    };

    // ---- FETCH RESTAURANTS VIA API ----
    const fetchRestaurants = async (options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const {
                query = '',
                cuisines = [],
                priceFilter = null,
                ratingFilter = 0,
                openNowFilter = false,
            } = options;

            // Convert price filter to API format
            const priceRangeMap = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
            
            const params = {
                search: query,
                cuisine_type: cuisines.join(','),
                min_rating: ratingFilter,
                price_range: priceFilter ? priceRangeMap[priceFilter] : null,
                open_now: openNowFilter ? true : null
            };

            const response = await api.get('/restaurants', { params });
            const backendData = response.data;
            
            // Handle Laravel Pagination (backendData.data) or simple array (backendData)
            const rawResults = Array.isArray(backendData) ? backendData : (backendData.data || []);

            const results = rawResults.map(res => ({
                id: res.id,
                name: res.name,
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude,
                rating: res.rating || 0,
                user_ratings: res.reviews_count || 0,
                price_level: res.price_range === '$' ? 1 : res.price_range === '$$' ? 2 : res.price_range === '$$$' ? 3 : 4,
                open_now: res.is_open_now,
                types: [res.cuisine_type],
                image_url: res.image_url,
                photo_url: res.image_url,
            }));

            setRestaurants(results);
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
        fetchRecommendations();
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(newLoc);
                    initialLoadDone.current = true;
                    fetchRestaurants({ 
                        location: newLoc,
                        openNowFilter: openNow 
                    });
                },
                () => {
                    initialLoadDone.current = true;
                    fetchRestaurants({ 
                        location: { lat: 33.5731, lng: -7.5898 },
                        openNowFilter: openNow
                    });
                }
            );
        } else {
            initialLoadDone.current = true;
            fetchRestaurants({ 
                location: { lat: 33.5731, lng: -7.5898 },
                openNowFilter: openNow
            });
        }
    }, []);

    // Handle cuisine toggle
    const handleCuisineToggle = (cuisine) => {
        setSelectedCuisines(prev =>
            prev.includes(cuisine)
                ? prev.filter(c => c !== cuisine)
                : [...prev, cuisine]
        );
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCuisines, minRating, priceFilter, openNow]);

    // Re-fetch when filters change (debounced)
    useEffect(() => {
        if (!initialLoadDone.current) return;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            fetchRestaurants({
                query: searchQuery,
                cuisines: selectedCuisines,
                location: userLocation,
                priceFilter: priceFilter,
                ratingFilter: minRating,
                openNowFilter: openNow,
            });
        }, 500);

        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery, selectedCuisines, minRating, priceFilter, openNow, userLocation]);

    // Clear all filters
    const clearFilters = () => {
        setSelectedCuisines([]);
        setMinRating(0);
        setPriceFilter(null);
        setOpenNow(false);
        setSearchQuery('');
    };

    // --- RANKING & POPULARITY FORMULAS ---
    const calculateRankScore = (r) => {
        // formula: score = (rating × 0.6) + (review_count × 0.3) − (distance × 0.1)
        // Using a stable mock distance based on ID if real distance not available
        const pseudoDistance = (r.id % 50) / 10; 
        return (r.rating * 0.6) + ((r.user_ratings / 100) * 0.3) - (pseudoDistance * 0.1);
    };

    const calculatePopularityScore = (r) => {
        // formula: popularity_score = (reservations × 0.5) + (reviews × 0.3) + (rating × 0.2)
        // reservations mocked as user_ratings / 2
        const reservations = (r.user_ratings / 2);
        return (reservations * 0.5) + (r.user_ratings * 0.3) + (r.rating * 0.2);
    };

    // Derived restaurants with scores
    const sortedRestaurants = useMemo(() => {
        return [...restaurants].sort((a, b) => calculateRankScore(b) - calculateRankScore(a));
    }, [restaurants]);

    // Derive popular restaurants (sorted by popularity score)
    const popularRestaurants = useMemo(() => {
        return [...restaurants]
            .sort((a, b) => calculatePopularityScore(b) - calculatePopularityScore(a))
            .slice(0, 6);
    }, [restaurants]);

    // Paginated restaurants
    const paginatedRestaurants = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedRestaurants.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedRestaurants, currentPage]);

    const totalPages = Math.ceil(sortedRestaurants.length / ITEMS_PER_PAGE);
    const hasMore = currentPage < totalPages;

    // Load more handler
    const handleLoadMore = () => {
        if (hasMore) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // --- AUTOCOMPLETE LOGIC ---
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = [];
        // Match cuisines
        CUISINE_OPTIONS.forEach(c => {
            if (c.label.toLowerCase().includes(searchQuery.toLowerCase())) {
                filtered.push({ type: 'cuisine', text: c.label });
            }
        });
        // Match restaurant names
        restaurants.forEach(r => {
            if (r.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                filtered.push({ type: 'restaurant', text: r.name, id: r.id });
            }
        });

        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(filtered.length > 0);
    }, [searchQuery, restaurants, CUISINE_OPTIONS]);

    // Handle suggestion click
    const handleSuggestionClick = (s) => {
        if (s.type === 'cuisine') {
            handleCuisineToggle(s.text);
        } else {
            setSearchQuery(s.text);
            setHighlightedId(s.id);
        }
        setShowSuggestions(false);
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Price level to display string
    const priceDisplay = (level) => {
        if (!level) return '';
        return '€'.repeat(level);
    };

    // Handle Favorite Toggle
    const toggleFavorite = (id) => {
        setFavorites(prev => {
            const newFavs = prev.includes(id) 
                ? prev.filter(fid => fid !== id) 
                : [...prev, id];
            localStorage.setItem('food_finder_favorites', JSON.stringify(newFavs));
            return newFavs;
        });
    };

    const hasActiveFilters = selectedCuisines.length > 0 || minRating > 0 || priceFilter !== null || openNow;

    // Filtered restaurants for map (show all filtered results)
    const filteredForMap = sortedRestaurants;

    return (
        <div className="home-layout">
            <style>{`
                .home-layout {
                    display: flex; gap: 2rem; padding: 2rem; max-width: 1400px; margin: 0 auto;
                }
                .search-section {
                    margin-bottom: 2rem; position: relative;
                }
                .search-input-wrapper {
                    display: flex; align-items: center; background: var(--card-bg);
                    border: 2px solid var(--border-color); border-radius: var(--radius-lg);
                    padding: 0.75rem 1.25rem; transition: var(--transition);
                    box-shadow: var(--shadow-sm);
                }
                .search-input-wrapper:focus-within {
                    border-color: var(--primary); box-shadow: 0 0 0 4px rgba(240, 90, 40, 0.1);
                }
                .search-input {
                    border: none; background: none; outline: none; width: 100%;
                    margin-left: 0.75rem; font-size: 1.1rem; color: var(--text-main);
                }
                .filter-chip {
                    padding: 0.4rem 0.9rem; border-radius: var(--radius-full);
                    border: 1.5px solid var(--border-color); background: transparent;
                    font-size: 0.85rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex; align-items: center; gap: 0.4rem;
                }
                .filter-chip:hover {
                    border-color: var(--primary); transform: translateY(-1px);
                }
                .filter-chip.active {
                    background: var(--primary); border-color: var(--primary); color: white;
                    box-shadow: 0 4px 12px rgba(240, 90, 40, 0.2);
                }
                .filter-chip.active-rating {
                    background: var(--warning); border-color: var(--warning); color: white;
                }
                .filter-chip.active-price {
                    background: var(--success); border-color: var(--success); color: white;
                }
                .restaurant-card.highlighted {
                    border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary); transform: scale(1.03);
                }
                .skeleton-shimmer {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .favorite-btn {
                    position: absolute; top: 0.75rem; left: 0.75rem;
                    background: rgba(255,255,255,0.9); border: none; padding: 0.5rem;
                    border-radius: var(--radius-full); cursor: pointer; z-index: 10;
                    display: flex; align-items: center; justify-content: center;
                    transition: var(--transition); color: var(--text-muted);
                    box-shadow: var(--shadow-sm);
                }
                .favorite-btn:hover {
                    transform: scale(1.1); background: white; color: var(--danger);
                }
                .popular-scroll {
                    display: flex; gap: 1.5rem; overflow-x: auto; padding: 0.5rem 0.5rem 1.5rem 0.5rem;
                    scrollbar-width: none; -ms-overflow-style: none;
                }
                .popular-scroll::-webkit-scrollbar { display: none; }

                .suggestions-dropdown {
                    position: absolute; top: 100%; left: 0; right: 0;
                    background: var(--card-bg); border: 1px solid var(--border-color);
                    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
                    box-shadow: var(--shadow-lg); z-index: 1000; overflow: hidden;
                    margin-top: -2px;
                }
                .suggestion-item {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 0.75rem 1.25rem; cursor: pointer; transition: var(--transition);
                    color: var(--text-main); font-size: 0.95rem; border-bottom: 1px solid var(--border-color);
                }
                .suggestion-item:last-child { border-bottom: none; }
                .suggestion-item:hover { background: var(--bg-secondary); }
                .suggestion-icon { color: var(--text-muted); }
                .suggestion-type { 
                    font-size: 0.65rem; text-transform: uppercase; font-weight: 700;
                    color: var(--primary); background: rgba(240, 90, 40, 0.1);
                    padding: 0.1rem 0.4rem; border-radius: 4px; margin-left: auto;
                }

                @media (max-width: 1024px) {
                    .home-layout { flex-direction: column; padding: 1rem; }
                    aside { width: 100% !important; position: static !important; }
                }
            `}</style>

            {/* Filters Sidebar */}
            <aside style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem' }}>
                            <Filter size={18} /> {t('common.filters', 'Filtres')}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {hasActiveFilters && (
                                <button
                                    id="clear-filters-btn"
                                    onClick={clearFilters}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                    <X size={14} /> {t('common.clear', 'Effacer')}
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
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('common.cuisine_type', 'Type de cuisine')}</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {CUISINE_OPTIONS.map(cuisine => (
                                        <button
                                            key={cuisine.label}
                                            onClick={() => handleCuisineToggle(cuisine.label)}
                                            className={`filter-chip ${selectedCuisines.includes(cuisine.label) ? 'active' : ''}`}
                                        >
                                            {cuisine.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note minimale */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('common.min_rating', 'Note minimale')}</h4>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {RATING_OPTIONS.map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                                            className={`filter-chip ${minRating === rating ? 'active active-rating' : ''}`}
                                        >
                                            <Star size={14} fill={minRating === rating ? 'white' : 'none'} /> {rating}+
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prix */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('common.price', 'Prix')}</h4>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {PRICE_OPTIONS.map(price => (
                                        <button
                                            key={price.value}
                                            onClick={() => setPriceFilter(priceFilter === price.value ? null : price.value)}
                                            className={`filter-chip ${priceFilter === price.value ? 'active active-price' : ''}`}
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
                                        {t('common.open_now', 'Ouvert maintenant')}
                                    </span>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* Result count */}
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {loading ? t('common.loading', 'Recherche en cours...') : `${sortedRestaurants.length} ${t('common.results_found', 'résultats')}`}
                    </span>
                </div>
            </aside>

            {/* Results & Map */}
            <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Search Bar */}
                <div className="search-section" ref={suggestionRef}>
                    <div className="search-input-wrapper">
                        <Search size={22} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder={t('common.search_placeholder')}
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {showSuggestions && (
                        <div className="suggestions-dropdown">
                            {suggestions.map((s, idx) => (
                                <div 
                                    key={idx} 
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(s)}
                                >
                                    <span className="suggestion-icon">
                                        {s.type === 'cuisine' ? <Filter size={16} /> : <Search size={16} />}
                                    </span>
                                    <span>{s.text}</span>
                                    <span className="suggestion-type">{s.type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map - shows filtered results */}
                <div style={{ height: '320px', marginBottom: '2.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                    <RestaurantMap
                        restaurants={filteredForMap}
                        center={userLocation}
                        onMarkerClick={(id) => setHighlightedId(id)}
                    />
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
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: '10px' }}>
                                <TrendingUp size={24} color="var(--warning)" />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('common.popular_restaurants')}</h2>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('common.popular_description')}</p>
                            </div>
                        </div>
                        <div className="popular-scroll">
                            {popularRestaurants.map(restaurant => (
                                <RestaurantCard 
                                    key={`pop-${restaurant.id}`} 
                                    restaurant={restaurant} 
                                    isFavorite={favorites.includes(restaurant.id)}
                                    onToggleFavorite={() => toggleFavorite(restaurant.id)}
                                    isHighlighted={highlightedId === restaurant.id}
                                    onInteraction={() => setHighlightedId(restaurant.id)}
                                    style={{ minWidth: '280px' }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended for you */}
                {!loading && recommendations.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: '10px' }}>
                                <Star size={24} color="#6366f1" fill="#6366f1" />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('common.recommendations')}</h2>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('common.recommendations_description')}</p>
                            </div>
                        </div>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'
                        }}>
                            {recommendations.slice(0, 4).map(rec => (
                                <RestaurantCard 
                                    key={`rec-${rec.restaurant.id}`} 
                                    restaurant={rec.restaurant} 
                                    isFavorite={favorites.includes(rec.restaurant.id)}
                                    onToggleFavorite={() => toggleFavorite(rec.restaurant.id)}
                                    isHighlighted={highlightedId === rec.restaurant.id}
                                    onInteraction={() => setHighlightedId(rec.restaurant.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* All Restaurants */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>{t('common.all_restaurants')}</h2>
                    {hasActiveFilters && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {t('common.filters')} : {selectedCuisines.join(', ')} {minRating > 0 ? `• ★${minRating}+` : ''} {priceFilter ? `• ${priceDisplay(priceFilter)}` : ''} {openNow ? `• ${t('common.open_now')}` : ''}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[1, 2, 3, 4, 5, 6].map(n => <SkeletonCard key={n} />)}
                    </div>
                ) : sortedRestaurants.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', background: 'transparent', border: '2px dashed var(--border-color)' }}>
                        <Search size={48} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>{t('common.no_restaurant_found', 'Aucun restaurant trouvé')}</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>{t('common.no_restaurant_desc', "Essayez de modifier vos critères de recherche ou d'explorer une autre zone sur la carte.")}</p>
                        {hasActiveFilters && (
                            <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '1.5rem' }}>
                                {t('common.clear')}
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            {paginatedRestaurants.map(restaurant => (
                                <RestaurantCard 
                                    key={restaurant.id} 
                                    restaurant={restaurant} 
                                    isFavorite={favorites.includes(restaurant.id)}
                                    onToggleFavorite={() => toggleFavorite(restaurant.id)}
                                    isHighlighted={highlightedId === restaurant.id}
                                    onInteraction={() => setHighlightedId(restaurant.id)}
                                />
                            ))}
                        </div>
                        
                        {/* Load More Button - NOW WORKING */}
                        {hasMore && (
                            <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={handleLoadMore}
                                    style={{ padding: '0.75rem 2.5rem', borderRadius: 'var(--radius-full)' }}
                                >
                                    {t('common.load_more', 'Charger plus')}
                                </button>
                            </div>
                        )}
                        
                        {!hasMore && sortedRestaurants.length > 0 && (
                            <div style={{ textAlign: 'center', paddingBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {t('common.no_more_results', 'Aucun autre résultat')}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default Home;
