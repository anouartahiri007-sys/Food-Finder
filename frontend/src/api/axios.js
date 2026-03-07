import mockRestaurantsData from '../data/restaurants.json';

// Persistent data management
const getStoredData = (key, initial) => {
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(stored);
};

const saveStoredData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initialize persistent state
let restaurants = getStoredData('mock_restaurants', mockRestaurantsData.map((res, index) => ({
    ...res,
    owner_id: index < 3 ? 1 : 2,
    website: res.website || `https://restaurant${res.id}.com`,
    phone: res.phone || `+212 522-${100000 + res.id}`
})));

let users = getStoredData('mock_users', [
    { id: 1, name: 'John', last_name: 'Doe', email: 'john@example.com', password: 'password123', role: 'owner', gender: 'Male', dob: '1985-05-15' },
    { id: 2, name: 'Alice', last_name: 'Smith', email: 'alice@gmail.com', password: 'password123', role: 'customer', gender: 'Female', dob: '1992-08-20' },
    { id: 3, name: 'Bob', last_name: 'Johnson', email: 'bob@yahoo.fr', password: 'password123', role: 'customer', gender: 'Male', dob: '1988-11-10' }
]);

let auditLogs = getStoredData('mock_audit_logs', []);

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
            if (token === 'admin-token') {
                return { data: { id: 0, name: 'Admin', role: 'admin', email: 'admin_admin@gmail.com' } };
            }
            if (!token) throw { response: { status: 401, data: { message: 'Unauthenticated' } } };
            // In a real app, token would decode to user ID
            const user = users.find(u => u.id === 1) || users[0];
            return { data: user };
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
            return { data: restaurants.filter(r => r.owner_id === 1) };
        }

        if (url === '/owner/reservations' || url === '/reservations') {
            const ownerRestIds = restaurants.filter(r => r.owner_id === 1).map(r => r.id);
            return { data: reservations.filter(res => ownerRestIds.includes(res.restaurant_id)) };
        }

        // Admin Endpoints
        if (url === '/admin/users') {
            // Include password and logs in the response as requested
            const clients = users.filter(u => u.role === 'customer').map(u => {
                const userLogs = auditLogs.filter(l => l.email === u.email).sort((a, b) => b.id - a.id);
                return {
                    ...u,
                    login_time: userLogs[0]?.login_time || 'N/A',
                    logout_time: userLogs[0]?.logout_time || 'N/A'
                };
            });
            return { data: clients };
        }

        if (url === '/admin/restaurants') {
            return { data: restaurants };
        }

        return { data: [] };
    },
    post: async (url, data) => {
        console.log(`Mock POST: ${url}`, data);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (url === '/login') {
            const email = data.email;
            const password = data.password;

            if (email === 'admin_admin@gmail.com' && password === 'admin') {
                localStorage.setItem('token', 'admin-token');
                return { data: { user: { role: 'admin' }, token: 'admin-token' } };
            }

            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('token', `mock-token-${user.id}`);
                // Record Audit Log
                const newLog = {
                    id: Date.now(),
                    email: user.email,
                    login_time: new Date().toLocaleString(),
                    logout_time: 'En session...'
                };
                auditLogs.push(newLog);
                saveStoredData('mock_audit_logs', auditLogs);
                localStorage.setItem('current_log_id', newLog.id);

                return {
                    data: {
                        user: user,
                        access_token: `mock-token-${user.id}`,
                        token: `mock-token-${user.id}`
                    }
                };
            }
            throw { response: { status: 401, data: { message: 'Identifiants incorrects' } } };
        }

        if (url === '/logout') {
            const logId = localStorage.getItem('current_log_id');
            if (logId) {
                const index = auditLogs.findIndex(l => l.id === parseInt(logId));
                if (index !== -1) {
                    auditLogs[index].logout_time = new Date().toLocaleString();
                    saveStoredData('mock_audit_logs', auditLogs);
                }
            }
            localStorage.removeItem('token');
            localStorage.removeItem('current_log_id');
            return { data: { message: 'Logged out' } };
        }

        if (url === '/register') {
            const newUser = {
                id: users.length + 1,
                name: data.get('name'),
                last_name: data.get('last_name'),
                email: data.get('email'),
                password: data.get('password'), // In mock we store plain text
                role: data.get('role'),
                gender: data.get('gender'),
                dob: data.get('date_of_birth'),
                website: data.get('website') || '',
                phone: data.get('phone') || '',
                created_at: new Date().toISOString()
            };
            users.push(newUser);
            saveStoredData('mock_users', users);
            return { data: { message: 'Success', user: newUser } };
        }

        if (url === '/restaurants') {
            const newRes = {
                id: Date.now(),
                name: data.get('name'),
                description: data.get('description'),
                address: data.get('address'),
                cuisine_type: data.get('cuisine_type'),
                price_range: data.get('price_range'),
                opening_time: data.get('opening_time'),
                closing_time: data.get('closing_time'),
                phone: data.get('phone'),
                website: data.get('website'),
                rating: 0,
                reviews_count: 0,
                image_url: `https://picsum.photos/seed/${Date.now()}/600/300`,
                owner_id: 1
            };
            restaurants.push(newRes);
            saveStoredData('mock_restaurants', restaurants);
            return { data: newRes };
        }

        return { data: { message: 'Success (Mocked)' } };
    },
    put: async (url, data) => {
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
