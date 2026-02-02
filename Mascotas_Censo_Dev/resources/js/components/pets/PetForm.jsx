import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';

// ✅ CAMBIO: importar useAuth para leer rol del usuario actual
import { useAuth } from '@context/AuthContext';

function PetForm() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ CAMBIO: detectar si el usuario es veterinario
    const { currentUser } = useAuth();
    const isVeterinario = currentUser?.role === 'veterinario';
    
    const isViewMode = location.pathname.endsWith(`/pets/${id}`) && !location.pathname.includes('/edit');
    const isEditMode = location.pathname.includes('/edit');
    
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        species: 'perro',
        breed: '',
        size: 'mediano',
        age: '',
        vaccinated: false,
        food_type: '',
        last_vaccination: '',
        photo: null,
        owner_id: '',
        status: 'HABILITADO'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentOwner = await api.getCurrentOwner();
                
                if (id) {
                    const petResponse = await api.getPet(id);
                    setFormData({
                        ...petResponse.data,
                        last_vaccination: petResponse.data.last_vaccination?.split('T')[0] || '',
                        owner_id: currentOwner.data.id
                    });
                } else {
                    setFormData(prev => ({
                        ...prev,
                        owner_id: currentOwner.data.id
                    }));
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                navigate('/login');
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        // ✅ CAMBIO: veterinario NO puede editar
        if (isViewMode || isVeterinario) return;

        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        // ✅ CAMBIO: veterinario NO puede cambiar foto
        if (isViewMode || isVeterinario) return;

        setFormData({
            ...formData,
            photo: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        // ✅ CAMBIO: veterinario NO puede guardar
        if (isViewMode || isVeterinario) return;

        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            
            formDataToSend.append('name', formData.name);
            formDataToSend.append('species', formData.species);
            formDataToSend.append('breed', formData.breed);
            formDataToSend.append('size', formData.size);
            formDataToSend.append('age', formData.age);
            formDataToSend.append('vaccinated', formData.vaccinated ? '1' : '0');
            formDataToSend.append('food_type', formData.food_type);
            formDataToSend.append('last_vaccination', formData.last_vaccination);

            if (formData.photo && formData.photo instanceof File) {
                formDataToSend.append('photo', formData.photo);
            }

            for (let [key, value] of formDataToSend.entries()) {
                console.log(`FormData: ${key} =`, value);
            }

            if (id) {
                formDataToSend.append('_method', 'PUT');
                await api.updatePet(id, formDataToSend);
            } else {
                await api.createPet(formDataToSend);
            }

            navigate('/');
        } catch (error) {
            console.error('Error saving pet:', error);
            alert('Error al guardar: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        // ✅ CAMBIO: veterinario NO puede deshabilitar
        if (isVeterinario) return;

        if (window.confirm('¿Estás seguro de deshabilitar esta mascota?')) {
            try {
                await api.deletePet(id);
                navigate('/');
            } catch (error) {
                console.error('Error deleting pet:', error);
                alert('Error al deshabilitar la mascota');
            }
        }
    };

    if (loading) return <div className="text-center mt-5">Cargando formulario...</div>;

    // ✅ CAMBIO: en modo veterinario, forzamos "solo lectura"
    const readOnlyFields = isViewMode || isVeterinario;

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">
                                {isViewMode || isVeterinario
                                    ? 'Detalles de Mascota'
                                    : isEditMode
                                        ? 'Editar Mascota'
                                        : 'Registrar Nueva Mascota'
                                }
                            </h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group mb-3">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        readOnly={readOnlyFields}
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label>Especie</label>
                                            <select
                                                className="form-control"
                                                name="species"
                                                value={formData.species}
                                                onChange={handleChange}
                                                required
                                                disabled={readOnlyFields}
                                            >
                                                <option value="perro">Perro</option>
                                                <option value="gato">Gato</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label>Raza</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="breed"
                                                value={formData.breed}
                                                onChange={handleChange}
                                                required
                                                readOnly={readOnlyFields}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label>Tamaño</label>
                                            <select
                                                className="form-control"
                                                name="size"
                                                value={formData.size}
                                                onChange={handleChange}
                                                required
                                                disabled={readOnlyFields}
                                            >
                                                <option value="pequeño">Pequeño</option>
                                                <option value="mediano">Mediano</option>
                                                <option value="grande">Grande</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label>Edad (años)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                min="0"
                                                required
                                                readOnly={readOnlyFields}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label>Tipo de Alimentación</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="food_type"
                                                value={formData.food_type}
                                                onChange={handleChange}
                                                required
                                                readOnly={readOnlyFields}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group mb-3">
                                            <label>Última Vacunación</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="last_vaccination"
                                                value={formData.last_vaccination}
                                                onChange={handleChange}
                                                readOnly={readOnlyFields}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="vaccinated"
                                        name="vaccinated"
                                        checked={formData.vaccinated}
                                        onChange={handleChange}
                                        disabled={readOnlyFields}
                                    />
                                    <label className="form-check-label" htmlFor="vaccinated">Vacunado</label>
                                </div>

                                <div className="form-group mb-4">
                                    <label>Foto de la Mascota</label>

                                    {!readOnlyFields && (
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    )}

                                    {formData.photo_path && (
                                        <div className="mt-2">
                                            <img 
                                                src={`/storage/${formData.photo_path}`} 
                                                alt="Foto actual" 
                                                className="img-thumbnail mt-1" 
                                                style={{ maxHeight: '100px' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-end mt-4">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary me-2" 
                                        onClick={() => navigate('/')}
                                    >
                                        Volver
                                    </button>

                                    {/* ✅ CAMBIO: Veterinario NO ve Guardar */}
                                    {!readOnlyFields && (
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary me-2" 
                                            disabled={loading}
                                        >
                                            {loading ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    )}

                                    {/* ✅ CAMBIO: Veterinario NO ve Deshabilitar */}
                                    {id && !readOnlyFields && (
                                        <button 
                                            type="button" 
                                            className="btn btn-danger" 
                                            onClick={handleDelete}
                                        >
                                            Deshabilitar Mascota
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PetForm;
