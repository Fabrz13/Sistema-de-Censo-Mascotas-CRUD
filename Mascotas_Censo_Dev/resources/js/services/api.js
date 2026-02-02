import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Interceptor para añadir el token a TODAS las peticiones
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default {
    // Métodos para mascotas
    getPets() {
        return api.get('/pets');
    },
    createPet(petData) {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        return api.post('/pets', petData, config);
    },
    getPet(id) {
        return api.get(`/pets/${id}`);
    },
    updatePet(id, petData) {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        return api.post(`/pets/${id}`, petData, config);
    },
    deletePet(id) {
        return api.delete(`/pets/${id}`);
    },
    getVaccinationReport(params) {
        return api.get('/pets/vaccination-report', { params });
    },
    
    // Métodos para usuario autenticado
    getCurrentOwner() {
        return api.get('/owner');
    },

    getProfile() {
    return api.get('/profile');
    },
    updateProfile(profileData) {
        // Convertir FormData a objeto para debug
        const plainObject = {};
        profileData.forEach((value, key) => plainObject[key] = value);
        console.log('Datos a enviar:', plainObject);

        return api.post('/profile', profileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
    },
    disableAccount() {
        return api.post('/profile/disable');
    },

    register(ownerData) {
        return api.post('/register', ownerData);
    },
    login(credentials) {
        return api.post('/login', credentials);
    },
    logout() {
        return api.post('/logout', {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    },
};
