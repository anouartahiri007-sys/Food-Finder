import mockRestaurantsData from '../data/restaurants.json';

// Persistent data management
const getStoredData = (key, initial) => {
    const stored = localStorage.getItem(key);
    if (!stored) {
        // Enforce owner_id for initial data
        const enhanced = initial.map((res, index) => ({
            ...res,
            owner_id: index < 3 ? 1 : 2 // First 3 belong to mock user (ID 1)
        }));
        localStorage.setItem(key, JSON.stringify(enhanced));
        return enhanced;
    }
    return JSON.parse(stored);
};

const saveStoredData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initialize persistent state
let restaurants = getStoredData('mock_restaurants', mockRestaurantsData);
let reservations = getStoredData('mock_reservations', [
    {
        id: 101,
        user_id: 2,
        user: { name: 'Alice', last_name: 'Smith', email: 'alice@gmail.com' },
        restaurant_id: 1,
        restaurant: { name: 'Le Jardin Gastronomique' },
        reservation_date: '2026-03-10',
        reservation_time: '20:00',
        guests_count: 2,
        status: 'pending'
    },
    {
        id: 102,
        user_id: 3,
        user: { name: 'Bob', last_name: 'Johnson', email: 'bob@yahoo.fr' },
        restaurant_id: 2,
        restaurant: { name: 'Sushi Zen' },
        reservation_date: '2026-03-11',
        reservation_time: '13:30',
        guests_count: 4,
        status: 'confirmed'
    }
]);

// Simple mock implementation of axios
const api = {
    get: async (url, config) => {
        const fullUrl = config?.baseURL ? `${config.baseURL}${url}` : url;
        console.log(`Mock GET: ${fullUrl}`);
        await new Promise(resolve => setTimeout(resolve, 300));

        if (url.includes('/csrf-cookie')) {
            return { data: { message: 'CSRF Cookie set' } };
        }

        if (url === '/user') {
            const token = localStorage.getItem('token');
            if (!token) throw { response: { status: 401, data: { message: 'Unauthenticated' } } };
            return {
                data: {
                    id: 1,
                    name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    role: 'owner',
                    created_at: '2026-01-01T00:00:00Z'
                }
            };
        }

        if (url.startsWith('/restaurants/')) {
            const idSplit = url.split('/');
            const id = parseInt(idSplit[2]);
            const restaurant = restaurants.find(r => r.id === id);
            return { data: restaurant || {} };
        }

        if (url.startsWith('/restaurants')) {
            let results = [...restaurants];
            if (config?.params?.search) {
                const q = config.params.search.toLowerCase();
                results = results.filter(r => r.name.toLowerCase().includes(q) || r.cuisine_type.toLowerCase().includes(q));
            }
            return { data: results };
        }

        if (url === '/owner/restaurants') {
            const token = localStorage.getItem('token');
            if (!token) throw { response: { status: 401 } };
            // Return only restaurants belonging to owner ID 1
            return { data: restaurants.filter(r => r.owner_id === 1) };
        }

        if (url === '/owner/reservations' || url === '/reservations') {
            // Similarly filter reservations if needed, but for now show all related to owner's restaurants
            const ownerRestIds = restaurants.filter(r => r.owner_id === 1).map(r => r.id);
            return { data: reservations.filter(res => ownerRestIds.includes(res.restaurant_id)) };
        }

        return { data: [] };
    },
    post: async (url, data) => {
        console.log(`Mock POST: ${url}`, data);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (url === '/login') {
            localStorage.setItem('token', 'mock-jwt-token');
            return {
                data: {
                    user: { id: 1, name: 'John', email: 'john@example.com', role: 'owner' },
                    access_token: 'mock-jwt-token',
                    token: 'mock-jwt-token'
                }
            };
        }

        if (url === '/logout') {
            localStorage.removeItem('token');
            return { data: { message: 'Logged out' } };
        }

        if (url === '/restaurants') {
            const newRes = {
                id: Date.now(),
                name: data instanceof FormData ? data.get('name') : data.name,
                description: data instanceof FormData ? data.get('description') : data.description,
                address: data instanceof FormData ? data.get('address') : data.address,
                cuisine_type: data instanceof FormData ? data.get('cuisine_type') : data.cuisine_type,
                price_range: data instanceof FormData ? data.get('price_range') : data.price_range,
                opening_time: data instanceof FormData ? data.get('opening_time') : data.opening_time,
                closing_time: data instanceof FormData ? data.get('closing_time') : data.closing_time,
                phone: data instanceof FormData ? data.get('phone') : data.phone,
                website: data instanceof FormData ? data.get('website') : data.website,
                rating: 0,
                reviews_count: 0,
                image_url: `https://picsum.photos/seed/${Date.now()}/600/300`,
                owner_id: 1 // Default to current owner
            };
            restaurants.push(newRes);
            saveStoredData('mock_restaurants', restaurants);
            return { data: newRes };
        }

        if (url.startsWith('/restaurants/')) {
            // Update logic (Laravel PUT via POST with _method or direct POST)
            const id = parseInt(url.split('/')[2]);
            const index = restaurants.findIndex(r => r.id === id);
            if (index !== -1) {
                const updated = {
                    ...restaurants[index],
                    name: data instanceof FormData ? data.get('name') : data.name,
                    address: data instanceof FormData ? data.get('address') : data.address,
                    description: data instanceof FormData ? data.get('description') : data.description,
                    cuisine_type: data instanceof FormData ? data.get('cuisine_type') : data.cuisine_type,
                    price_range: data instanceof FormData ? data.get('price_range') : data.price_range,
                    opening_time: data instanceof FormData ? data.get('opening_time') : data.opening_time,
                    closing_time: data instanceof FormData ? data.get('closing_time') : data.closing_time,
                    phone: data instanceof FormData ? data.get('phone') : data.phone,
                    website: data instanceof FormData ? data.get('website') : data.website,
                };
                restaurants[index] = updated;
                saveStoredData('mock_restaurants', restaurants);
                return { data: updated };
            }
        }

        if (url === '/reservations') {
            const newReservation = {
                id: Date.now(),
                ...(data instanceof FormData ? Object.fromEntries(data) : data),
                status: 'pending',
                user: { name: 'User', last_name: 'Current' }
            };
            reservations.push(newReservation);
            saveStoredData('mock_reservations', reservations);
            return { data: newReservation };
        }

        return { data: { message: 'Success (Mocked)', user: { id: 1, role: 'owner' } } };
    },
    put: async (url, data) => {
        console.log(`Mock PUT: ${url}`, data);
        if (url.includes('/status')) {
            const id = parseInt(url.split('/')[2]);
            const index = reservations.findIndex(r => r.id === id);
            if (index !== -1) {
                reservations[index].status = data.status;
                saveStoredData('mock_reservations', reservations);
            }
        }
        return { data: { message: 'Updated (Mocked)' } };
    },
    delete: async (url) => {
        console.log(`Mock DELETE: ${url}`);
        if (url.startsWith('/restaurants/')) {
            const id = parseInt(url.split('/').pop());
            restaurants = restaurants.filter(r => r.id !== id);
            saveStoredData('mock_restaurants', restaurants);
        }
        return { data: { message: 'Deleted (Mocked)' } };
    },
    interceptors: {
        request: { use: () => { } },
        response: { use: () => { } }
    }
};

export default api;
