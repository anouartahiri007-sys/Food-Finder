import axios from 'axios';
import mockRestaurantsData from '../data/restaurants.json';

const USE_MOCK = import.meta.env.VITE_USE_MOCKS === 'true';

// Real Axios Instance
const realInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Interceptor for token
realInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- MOCK IMPLEMENTATION ---
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
let reservations = getStoredData('mock_reservations', []);

const mockApi = {
    get: async (url, config) => {
        console.log(`[MOCK] GET: ${url}`);
        await new Promise(r => setTimeout(r, 400));
        
        if (url === '/user' || url === '/profile') {
            const token = localStorage.getItem('token');
            if (!token) throw { response: { status: 401 } };
            return { data: users[0] };
        }
        
        if (url === '/restaurants') {
            let results = [...restaurants];
            const q = config?.params?.search?.toLowerCase();
            if (q) results = results.filter(r => r.name.toLowerCase().includes(q));
            return { data: results };
        }

        if (url === '/recommendations') {
            return { data: restaurants.slice(0, 4) };
        }

        return { data: [] };
    },
    post: async (url, data) => {
        console.log(`[MOCK] POST: ${url}`, data);
        await new Promise(r => setTimeout(r, 600));
        
        if (url === '/login') {
            localStorage.setItem('token', 'mock-token');
            return { data: { user: users[0], token: 'mock-token' } };
        }
        
        if (url === '/logout') {
            localStorage.removeItem('token');
            return { data: { message: 'Logged out' } };
        }

        return { data: { message: 'Success' } };
    },
    put: async (url, data) => ({ data: { message: 'Updated' } }),
    delete: async (url) => ({ data: { message: 'Deleted' } }),
    interceptors: { request: { use: () => {} }, response: { use: () => {} } }
};

// Export based on toggle
const api = USE_MOCK ? mockApi : realInstance;

export default api;
