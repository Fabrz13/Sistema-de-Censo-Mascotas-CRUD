import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default {
    getPets() {
        return api.get('/pets');
    },
    createPet(petData) {
        return api.post('/pets', petData);
    },
    getPet(id) {
        return api.get(`/pets/${id}`);
    },
    updatePet(id, petData) {
        return api.put(`/pets/${id}`, petData);
    },
    deletePet(id) {
        return api.delete(`/pets/${id}`);
    },
    getVaccinationReport() {
        return api.get('/pets/vaccination-report');
    }
};