import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { Star, MapPin } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: 'inherit'
};

const RestaurantMap = ({ restaurants = [], center = { lat: 33.5731, lng: -7.5898 }, onMarkerClick }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    const handleMarkerClick = (restaurant) => {
        setSelectedRestaurant(restaurant);
        if (onMarkerClick) onMarkerClick(restaurant.id);
        if (map) {
            map.panTo({ lat: parseFloat(restaurant.latitude), lng: parseFloat(restaurant.longitude) });
        }
    };

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    // Fit map bounds when restaurants change
    useEffect(() => {
        if (!map || !restaurants || restaurants.length === 0) return;

        const bounds = new window.google.maps.LatLngBounds();
        let hasValidCoords = false;

        restaurants.forEach(r => {
            if (r.latitude && r.longitude) {
                bounds.extend({ lat: parseFloat(r.latitude), lng: parseFloat(r.longitude) });
                hasValidCoords = true;
            }
        });

        if (hasValidCoords) {
            map.fitBounds(bounds);
            // Don't zoom too far in for single result
            if (restaurants.length === 1) {
                const listener = window.google.maps.event.addListener(map, 'idle', function () {
                    if (map.getZoom() > 16) map.setZoom(16);
                    window.google.maps.event.removeListener(listener);
                });
            }
        }
    }, [restaurants, map]);

    if (!isLoaded) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '100%', backgroundColor: '#f0f0f0', borderRadius: 'inherit',
                fontSize: '0.9rem', color: '#666',
            }}>
                Chargement de la carte...
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%', borderRadius: 'inherit' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    styles: [
                        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
                        { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
                    ],
                }}
            >
                <MarkerClusterer>
                    {(clusterer) =>
                        restaurants
                            .filter(r => r.latitude && r.longitude)
                            .map((restaurant) => (
                                <Marker
                                    key={restaurant.id}
                                    position={{ lat: parseFloat(restaurant.latitude), lng: parseFloat(restaurant.longitude) }}
                                    clusterer={clusterer}
                                    onClick={() => handleMarkerClick(restaurant)}
                                    icon={{
                                        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                        scaledSize: { width: 40, height: 40 }
                                    }}
                                />
                            ))
                    }
                </MarkerClusterer>

                {selectedRestaurant && (
                    <InfoWindow
                        position={{ lat: parseFloat(selectedRestaurant.latitude), lng: parseFloat(selectedRestaurant.longitude) }}
                        onCloseClick={() => setSelectedRestaurant(null)}
                    >
                        <div style={{ padding: '0.25rem', maxWidth: '240px', fontFamily: 'var(--font-body)' }}>
                            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                                <img
                                    src={selectedRestaurant.photo_url || `https://picsum.photos/seed/${selectedRestaurant.id}/400/300`}
                                    alt={selectedRestaurant.name}
                                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <div style={{
                                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                                    background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.2rem 0.5rem',
                                    borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700',
                                    display: 'flex', alignItems: 'center', gap: '0.2rem'
                                }}>
                                    <Star size={12} fill="#fbbf24" color="#fbbf24" /> {selectedRestaurant.rating}
                                </div>
                            </div>
                            <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontSize: '1rem', fontWeight: '700' }}>
                                {selectedRestaurant.name}
                            </h3>
                            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <MapPin size={12} /> {selectedRestaurant.address}
                            </p>
                            <a 
                                href={`/restaurants/${selectedRestaurant.id}`}
                                style={{
                                    display: 'block', textAlign: 'center', background: 'var(--primary)',
                                    color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)',
                                    fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none',
                                    transition: 'var(--transition)'
                                }}
                            >
                                Voir le restaurant
                            </a>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default RestaurantMap;
