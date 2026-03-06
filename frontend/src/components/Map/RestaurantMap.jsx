import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Star, MapPin } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: 'inherit'
};

const RestaurantMap = ({ restaurants = [], center = { lat: 33.5731, lng: -7.5898 } }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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
        } else if (center) {
            map.setCenter(center);
            map.setZoom(13);
        }
    }, [restaurants, map, center]);

    // Close info window when restaurants change
    useEffect(() => {
        setSelectedRestaurant(null);
    }, [restaurants]);

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
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <div style={{
                    position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: 'var(--danger)', color: 'white',
                    padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem',
                }}>
                    ⚠️ Clé API Google Maps manquante
                </div>
            )}
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
                {restaurants
                    .filter(r => r.latitude && r.longitude)
                    .map(restaurant => (
                        <Marker
                            key={restaurant.id}
                            position={{ lat: parseFloat(restaurant.latitude), lng: parseFloat(restaurant.longitude) }}
                            onClick={() => setSelectedRestaurant(restaurant)}
                            icon={{
                                url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
                            }}
                        />
                    ))}

                {selectedRestaurant && (
                    <InfoWindow
                        position={{ lat: parseFloat(selectedRestaurant.latitude), lng: parseFloat(selectedRestaurant.longitude) }}
                        onCloseClick={() => setSelectedRestaurant(null)}
                    >
                        <div style={{ padding: '0.25rem', maxWidth: '220px', fontFamily: 'system-ui, sans-serif' }}>
                            {selectedRestaurant.photo_url && (
                                <img
                                    src={selectedRestaurant.photo_url}
                                    alt={selectedRestaurant.name}
                                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }}
                                />
                            )}
                            <h3 style={{ margin: '0 0 0.25rem 0', color: '#1a1a1a', fontSize: '1rem', fontWeight: '700' }}>
                                {selectedRestaurant.name}
                            </h3>
                            <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.78rem', color: '#666', lineHeight: '1.3' }}>
                                {selectedRestaurant.address}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontWeight: '600', color: '#f59e0b' }}>
                                    ★ {selectedRestaurant.rating}
                                </span>
                                <span style={{ color: '#999' }}>({selectedRestaurant.user_ratings} avis)</span>
                                {selectedRestaurant.price_level && (
                                    <span style={{ color: '#10b981', fontWeight: '600' }}>
                                        {'€'.repeat(selectedRestaurant.price_level)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default RestaurantMap;
