import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function PetList() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        species: '',
        vaccinated: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await api.getPets();
                setPets(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching pets:', error);
                setLoading(false);
            }
        };

        fetchPets();
    }, []);

    const handleLogout = async () => {
        try {
            await api.logout();
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const handleDelete = async (petId) => {
        if (window.confirm('¿Estás seguro de deshabilitar esta mascota?')) {
            try {
                await api.deletePet(petId);
                // Actualizar lista después de deshabilitar
                const response = await api.getPets();
                setPets(response.data);
            } catch (error) {
                console.error('Error deleting pet:', error);
            }
        }
    };

    const filteredPets = pets.filter(pet => {
        const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSpecies = filters.species ? pet.species === filters.species : true;
        const matchesVaccination = filters.vaccinated !== '' ? pet.vaccinated === (filters.vaccinated === 'true') : true;

        return matchesSearch && matchesSpecies && matchesVaccination;
    });

    if (loading) return <div className="text-center">Cargando mascotas...</div>;

    return (
        <div>
            {/* Barra superior con título y botones */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Sistema de Censo de Mascotas</h1>
                <div>
                    <Link to="/pets/new" className="btn btn-primary me-2">
                        Registrar Nueva Mascota
                    </Link>
                    <button onClick={handleLogout} className="btn btn-outline-danger">
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Filtros de búsqueda */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre o raza"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-control"
                        value={filters.species}
                        onChange={(e) => setFilters({...filters, species: e.target.value})}
                    >
                        <option value="">Todas las especies</option>
                        <option value="perro">Perro</option>
                        <option value="gato">Gato</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-control"
                        value={filters.vaccinated}
                        onChange={(e) => setFilters({...filters, vaccinated: e.target.value})}
                    >
                        <option value="">Todos</option>
                        <option value="true">Vacunados</option>
                        <option value="false">No vacunados</option>
                    </select>
                </div>
            </div>

            {/* Listado de mascotas */}
            <div className="row">
                <div className="col">
                    <h2>Listado de Mascotas</h2>

                    {filteredPets.length === 0 ? (
                        <div className="alert alert-info">No se encontraron mascotas</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Especie</th>
                                        <th>Raza</th>
                                        <th>Tamaño</th>
                                        <th>Vacunado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPets.map(pet => (
                                        <tr key={pet.id}>
                                            <td>{pet.name}</td>
                                            <td>{pet.species}</td>
                                            <td>{pet.breed}</td>
                                            <td>{pet.size}</td>
                                            <td>{pet.vaccinated ? 'Sí' : 'No'}</td>
                                            <td>
                                                 <Link to={`/pets/${pet.id}`} className="btn btn-sm btn-info me-2">
                                                    Ver
                                                </Link>
                                                <Link to={`/pets/${pet.id}/edit`} className="btn btn-sm btn-warning me-2">
                                                    Editar
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(pet.id)} 
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Deshabilitar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PetList;