import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

function PetForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        species: 'perro',
        breed: '',
        size: 'mediano',
        age: '',
        vaccinated: false,
        food_type: '',
        owner_id: '',
        last_vaccination: '',
        photo: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener lista de dueños
                const ownersResponse = await api.get('/owners');
                setOwners(ownersResponse.data);

                // Si es edición, cargar datos de la mascota
                if (id) {
                    const petResponse = await api.getPet(id);
                    setFormData({
                        ...petResponse.data,
                        last_vaccination: petResponse.data.last_vaccination?.split('T')[0] || ''
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            photo: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            for (const key in formData) {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            }

            if (id) {
                await api.updatePet(id, data);
            } else {
                await api.createPet(data);
            }

            navigate('/');
        } catch (error) {
            console.error('Error saving pet:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center">Cargando formulario...</div>;

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <h2>{id ? 'Editar Mascota' : 'Registrar Nueva Mascota'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Especie</label>
                        <select
                            className="form-control"
                            name="species"
                            value={formData.species}
                            onChange={handleChange}
                            required
                        >
                            <option value="perro">Perro</option>
                            <option value="gato">Gato</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Raza</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="breed"
                                    value={formData.breed}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Tamaño</label>
                                <select
                                    className="form-control"
                                    name="size"
                                    value={formData.size}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="pequeño">Pequeño</option>
                                    <option value="mediano">Mediano</option>
                                    <option value="grande">Grande</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Edad (años)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Dueño</label>
                                <select
                                    className="form-control"
                                    name="owner_id"
                                    value={formData.owner_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione un dueño</option>
                                    {owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>
                                            {owner.name} - {owner.phone}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Tipo de Alimentación</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="food_type"
                                    value={formData.food_type}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>Última Vacunación</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="last_vaccination"
                                    value={formData.last_vaccination}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="vaccinated"
                            name="vaccinated"
                            checked={formData.vaccinated}
                            onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="vaccinated">Vacunado</label>
                    </div>

                    <div className="form-group">
                        <label>Foto de la Mascota</label>
                        <input
                            type="file"
                            className="form-control-file"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PetForm;