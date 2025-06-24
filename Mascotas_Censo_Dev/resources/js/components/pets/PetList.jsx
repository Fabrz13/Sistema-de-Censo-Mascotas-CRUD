import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function PetList() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        species: '',
        vaccinated: ''
    });

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

            <div className="row">
                <div className="col">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2>Listado de Mascotas</h2>
                        <Link to="/pets/new" className="btn btn-primary">
                            Registrar Nueva Mascota
                        </Link>
                    </div>

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
                                                <Link to={`/pets/${pet.id}`} className="btn btn-sm btn-info mr-2">
                                                    Ver
                                                </Link>
                                                <Link to={`/pets/${pet.id}/edit`} className="btn btn-sm btn-warning">
                                                    Editar
                                                </Link>
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