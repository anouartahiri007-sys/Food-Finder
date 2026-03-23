import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Star, Utensils, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const MenuPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [restaurantRes, menusRes] = await Promise.all([
                    api.get(`/restaurants/${id}`),
                    api.get(`/restaurants/${id}/menus`)
                ]);
                setRestaurant(restaurantRes.data);
                setMenus(menusRes.data);
            } catch (err) {
                setError(t('restaurant.load_error'));
                toast.error(t('common.load_error'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, t]);

    // Get all categories from menus
    const categories = [...new Set(menus.flatMap(menu => 
        menu.menu_items?.map(item => item.category).filter(Boolean)
    ))];

    // Filter items by category
    const getItemsByCategory = (category) => {
        return menus.flatMap(menu => 
            menu.menu_items?.filter(item => item.category === category) || []
        );
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="menu-page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <Link to={`/restaurants/${id}`} style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: 'var(--text-muted)', 
                textDecoration: 'none',
                marginBottom: '1.5rem',
                fontWeight: '500'
            }}>
                <ArrowLeft size={18} /> {t('menu.back_to_restaurant')}
            </Link>

            {restaurant && (
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, #e55a2b 100%)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                            <img 
                                src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'} 
                                alt={restaurant.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{restaurant.name}</h1>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', opacity: 0.9 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Star size={14} fill="currentColor" /> {restaurant.rating || t('restaurant.new')}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <MapPin size={14} /> {restaurant.address}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: 'var(--radius-full)',
                            border: selectedCategory === null ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            background: selectedCategory === null ? 'var(--primary)' : 'transparent',
                            color: selectedCategory === null ? 'white' : 'var(--text-main)',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {t('common.filters')}
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: 'var(--radius-full)',
                                border: selectedCategory === category ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                background: selectedCategory === category ? 'var(--primary)' : 'transparent',
                                color: selectedCategory === category ? 'white' : 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Menu Content */}
            {menus.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Utensils size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('menu.menu_unavailable')}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('menu.menu_unavailable_desc')}</p>
                </div>
            ) : (
                <div className="menu-sections">
                    {menus.map(menu => {
                        const menuItems = selectedCategory 
                            ? menu.menu_items?.filter(item => item.category === selectedCategory) 
                            : menu.menu_items;
                        
                        if (!menuItems || menuItems.length === 0) return null;

                        return (
                            <div key={menu.id} className="card" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Utensils size={20} className="text-primary" />
                                        {menu.name}
                                    </h2>
                                    {menu.description && (
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {menu.description}
                                        </p>
                                    )}
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    {menuItems.map((item, index) => (
                                        <div 
                                            key={item.id} 
                                            style={{ 
                                                padding: '1rem 1.25rem',
                                                display: 'flex',
                                                gap: '1rem',
                                                borderBottom: index < menuItems.length - 1 ? '1px solid var(--border-color)' : 'none',
                                                transition: 'background 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {item.image && (
                                                <div style={{ width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{item.name}</h4>
                                                    <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1rem', marginLeft: '1rem', whiteSpace: 'nowrap' }}>
                                                        {item.price} €
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                                        {item.description}
                                                    </p>
                                                )}
                                                {item.allergens && item.allergens.length > 0 && (
                                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                                        {item.allergens.map((allergen, idx) => (
                                                            <span key={idx} style={{ 
                                                                fontSize: '0.7rem', 
                                                                padding: '0.15rem 0.4rem', 
                                                                background: 'rgba(239,68,68,0.1)', 
                                                                color: 'var(--danger)',
                                                                borderRadius: '4px',
                                                                fontWeight: '500'
                                                            }}>
                                                                {allergen}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Back to restaurant */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to={`/restaurants/${id}`} className="btn btn-primary">
                    {t('menu.see_restaurant_details')}
                </Link>
            </div>
        </div>
    );
};

export default MenuPage;
