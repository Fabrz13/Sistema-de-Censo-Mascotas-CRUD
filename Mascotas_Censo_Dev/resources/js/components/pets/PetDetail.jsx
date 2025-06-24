import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

function PetDetail() {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const response = await api.getPet(id);
                setPet(response.data);
                setLoading(false);
            } catch (err) {
                setError('No se pudo cargar la información de la mascota');
                setLoading(false);
            }
        };

        fetchPet();
    }, [id]);

    if (loading) return <div className="text-center">Cargando...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!pet) return <div className="alert alert-info">Mascota no encontrada</div>;

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h3>Detalles de {pet.name}</h3>
                        <Link to={`/pets/${pet.id}/edit`} className="btn btn-warning">
                            Editar
                        </Link>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">
                                {pet.photo_path ? (
                                    <img 
                                        src={`/storage/${pet.photo_path}`} 
                                        alt={pet.name}
                                        className="img-fluid rounded mb-3"
                                    />
                                ) : (
                                    <div className="text-center py-4 bg-light rounded mb-3">
                                        <i className="fas fa-paw fa-5x text-muted"></i>
                                        <p className="mt-2">Sin imagen</p>
                                    </div>
                                )}
                            </div>
                            <div className="col-md-8">
                                <h4>Información Básica</h4>
                                <ul className="list-group list-group-flush mb-4">
                                    <li className="list-group-item">
                                        <strong>Especie:</strong> {pet.species}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Raza:</strong> {pet.breed}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Tamaño:</strong> {pet.size}
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Edad:</strong> {pet.age} años
                                    </li>
                                    <li className="list-group-item">
                                        <strong>Vacunado:</strong> {pet.vaccinated ? 'Sí' : 'No'}
                                    </li>
                                    {pet.last_vaccination && (
                                        <li className="list-group-item">
                                            <strong>Última vacunación:</strong> {new Date(pet.last_vaccination).toLocaleDateString()}
                                        </li>
                                    )}
                                    <li className="list-group-item">
                                        <strong>Tipo de alimentación:</strong> {pet.food_type}
                                    </li>
                                </ul>

                                <h4>Información del Dueño</h4>
                                {pet.owner && (
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item">
                                            <strong>Nombre:</strong> {pet.owner.name}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Dirección:</strong> {pet.owner.address}
                                        </li>
                                        <li className="list-group-item">
                                            <strong>Teléfono:</strong> {pet.owner.phone}
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <Link to="/" className="btn btn-secondary">
                        Volver al listado
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PetDetail;