import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';

function Profile() {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        phone: '',
        photo: null,
        location: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                email: currentUser.email,
                address: currentUser.address,
                phone: currentUser.phone,
                photo: null,
                location: currentUser.location ? JSON.stringify(currentUser.location) : ''
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
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
            const formDataToSend = new FormData();
            formDataToSend.append('_method', 'PUT');
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('phone', formData.phone);
            
            if (formData.location) {
                formDataToSend.append('location', formData.location);
            }
            
            if (formData.photo instanceof File) {
                formDataToSend.append('photo', formData.photo);
            }

            const response = await api.updateProfile(formDataToSend);
            
            // Actualizar el contexto de autenticación
            if (setCurrentUser) {
                setCurrentUser(response.data.user || response.data);
            }
            
            setEditMode(false);
        } catch (error) {
            console.error('Error completo:', error);
            
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                let errorMessage = 'Errores de validación:\n';
                
                for (const field in errors) {
                    errorMessage += `${field}: ${errors[field].join(', ')}\n`;
                }
                
                alert(errorMessage);
            } else {
                alert('Error al actualizar el perfil. Por favor intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDisableAccount = async () => {
        if (window.confirm('¿Estás seguro de deshabilitar tu cuenta? Esta acción no se puede deshacer y perderás acceso al sistema.')) {
            try {
                await api.disableAccount();
                localStorage.removeItem('token');
                navigate('/login');
            } catch (error) {
                console.error('Error disabling account:', error);
                alert('Error al deshabilitar la cuenta');
            }
        }
    };

    if (!currentUser) return <div className="text-center py-5">Cargando perfil...</div>;

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Perfil de Usuario</h3>
                        </div>
                        <div className="card-body">
                            {editMode ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
                                        <label>Nombre Completo</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Dirección</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Teléfono</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Ubicación (JSON)</label>
                                        <textarea
                                            className="form-control"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label>Foto de Perfil</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                        {currentUser.photo_path && (
                                            <div className="mt-2">
                                                <img 
                                                    src={`/storage/${currentUser.photo_path}`} 
                                                    alt="Foto actual" 
                                                    className="img-thumbnail mt-1" 
                                                    style={{maxHeight: '100px'}}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary"
                                            onClick={() => setEditMode(false)}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div className="text-center mb-4">
                                        {currentUser.photo_path ? (
                                            <img 
                                                src={`/storage/${currentUser.photo_path}`} 
                                                alt="Foto de perfil" 
                                                className="rounded-circle"
                                                style={{width: '150px', height: '150px', objectFit: 'cover'}}
                                            />
                                        ) : (
                                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                                style={{width: '150px', height: '150px', margin: '0 auto'}}>
                                                <i className="bi bi-person" style={{fontSize: '4rem', color: 'white'}}></i>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <h5>Información Personal</h5>
                                        <hr />
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>Nombre:</strong> {currentUser.name}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Email:</strong> {currentUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>Teléfono:</strong> {currentUser.phone}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Estado: </strong> 
                                                    <span className={`badge ${currentUser.status === 'HABILITADO' ? 'bg-success' : 'bg-danger'}`}>
                                                        {currentUser.status}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <p><strong>Dirección:</strong> {currentUser.address}</p>
                                        {currentUser.location && (
                                            <p><strong>Ubicación:</strong> {JSON.stringify(currentUser.location)}</p>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-end gap-2">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => setEditMode(true)}
                                        >
                                            Editar Perfil
                                        </button>
                                        <button 
                                            className="btn btn-danger"
                                            onClick={handleDisableAccount}
                                        >
                                            Deshabilitar Cuenta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;