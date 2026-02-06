import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = ({ expanded, toggleSidebar }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const roleLabels = {
    superadmin: 'Super Administrador',
    veterinario: 'Veterinario'
    };

    const mascotasLabelByRole = {
    cliente: 'Mis Mascotas',
    veterinario: 'Mis Pacientes',
    superadmin: 'Lista de Mascotas'
    };

    const mascotasLabel =
    mascotasLabelByRole[currentUser?.role] || 'Lista de Mascotas';

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className={`sidebar bg-dark text-white d-flex flex-column ${expanded ? 'expanded' : 'collapsed'}`} 
            style={{ minHeight: '100vh', height: '100%' }}>
            <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
                {expanded ? (
                    <h4 className="m-0">Vet Lomas</h4>
                ) : (
                    <button 
                        onClick={toggleSidebar}
                        className="btn btn-dark border-0 p-2 d-flex align-items-center justify-content-center rounded"
                        title="Expandir"
                        style={{
                            transition: 'background-color 0.3s',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)' // Sombreado inicial leve
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    >
                        <h4 className="m-0 fw-bold" style={{ fontSize: '1.1rem' }}>VL</h4>
                    </button>
                )}
                
                {/* Flecha lateral: la mantenemos como botón independiente solo si está expandido */}
                {expanded && (
                    <button 
                        onClick={toggleSidebar}
                        className="btn btn-link text-white p-0 opacity-50 hover-opacity-100"
                    >
                        <i className={`bi bi-chevron-left`}></i>
                    </button>
                )}
            </div>

            <div className="user-profile p-3 text-center border-bottom border-secondary">
                {currentUser && (
                    <>
                        <div className="mb-3">
                            <img
                            src={
                                currentUser?.photo_path
                                ? `/storage/${currentUser.photo_path}`
                                : '/storage/user.png'
                            }
                            onError={(e) => {
                                e.target.src = '/storage/user.png';
                            }}
                            alt="User profile"
                            className="rounded-circle"
                            style={{
                                width: expanded ? '80px' : '40px',
                                height: expanded ? '80px' : '40px',
                                objectFit: 'cover'
                            }}
                            />
                        </div>
                        {expanded && (
                            <>
                                <h6 className="m-0">{currentUser.name}</h6>

                                {(currentUser.role === 'superadmin' || currentUser.role === 'veterinario') && (
                                    <small className="text-light opacity-75">
                                        <i className="bi bi-shield-check me-1"></i>
                                        {roleLabels[currentUser.role]}
                                    </small>
                                )}
                            </>
                        )}

                    </>
                )}
            </div>
            
            <div className="flex-grow-1">
                <ul className="nav flex-column px-2">
                    <li className="nav-item">
                        <Link to="/profile" className="nav-link text-white d-flex align-items-center">
                            <i className="bi bi-person me-2"></i>
                            {expanded && 'Mi Perfil'}
                        </Link>
                    </li>
                    {currentUser?.role !== 'veterinario' && (
                        <li className="nav-item">
                            <Link
                                to="/medical-consultations/schedule"
                                className="nav-link text-white d-flex align-items-center"
                            >
                                <i className="bi bi-calendar-plus me-2"></i>
                                {expanded && 'Agendar cita médica'}
                            </Link>
                        </li>
                    )}
                    <li className="nav-item">
                    <Link to="/medical-consultations" className="nav-link text-white d-flex align-items-center">
                        <i className="bi bi-clipboard2-pulse me-2"></i>
                        {expanded && (currentUser?.role === 'superadmin' ? 'Citas Veterinarias' : 'Mis Citas')}
                    </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/" className="nav-link text-white d-flex align-items-center">
                            <i className="bi bi-list-ul me-2"></i>
                            {expanded && mascotasLabel}
                        </Link>
                    </li>
                    {currentUser?.role === 'superadmin' && (
                    <li className="nav-item">
                        <Link to="/users" className="nav-link text-white d-flex align-items-center">
                        <i className="bi bi-people me-2"></i>
                        {expanded && 'Usuarios'}
                        </Link>
                    </li>
                    )}
                    {/* Puedes agregar más opciones aquí */}
                </ul>

                <div className="sidebar-footer mt-auto p-3">
                    <button 
                        onClick={handleLogout}
                        className="btn btn-link text-white d-flex align-items-center w-100"
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        {expanded && 'Cerrar Sesión'}
                    </button>
                </div>
            </div>

            <div className="mt-auto mb-3 d-flex flex-column align-items-center justify-content-center opacity-75" 
                style={{ 
                    overflow: 'hidden', 
                    width: '100%',
                    paddingLeft: '0', 
                    paddingRight: '0',
                    maxWidth: '100%' // Evita que se expanda más allá del sidebar
                }}> 
                
                <img
                    src="pet-health.png"
                    alt="Logo"
                    style={{ 
                        // Reducimos drásticamente para la prueba a 30px
                        width: expanded ? 86 : 30, 
                        height: expanded ? 86 : 30,
                        transition: 'all 0.3s ease',
                        objectFit: 'contain',
                        display: 'block' // Elimina espacios fantasma debajo de la imagen
                    }}
                />
                
                {expanded && (
                    <small className="text-white-50 text-center px-2" 
                        style={{ 
                            fontSize: '0.7rem', 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%' 
                        }}>
                        Lo Mejor Para tu Mascota
                    </small>
                )}
            </div>
        </div>
    );
};

export default Sidebar;

