import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '@context/AuthContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar = ({ expanded, toggleSidebar }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.logout();
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className={`sidebar bg-dark text-white ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-header d-flex justify-content-between align-items-center p-3">
                {expanded ? (
                    <h4 className="m-0">Pet Health</h4>
                ) : (
                    <h4 className="m-0">PH</h4>
                )}
                <button 
                    onClick={toggleSidebar}
                    className="btn btn-link text-white"
                >
                    <i className={`bi bi-chevron-${expanded ? 'left' : 'right'}`}></i>
                </button>
            </div>

            <div className="user-profile p-3 text-center">
                {currentUser && (
                    <>
                        <div className="mb-3">
                        <img 
                            src={currentUser?.photo_path ? `/storage/${currentUser.photo_path}` : '/storage/pets/user.avif'}
                            alt="User profile" 
                            className="rounded-circle"
                            style={{ width: expanded ? '80px' : '40px', height: expanded ? '80px' : '40px', objectFit: 'cover' }}
                        />
                        </div>
                        {expanded && (
                            <h6 className="m-0">{currentUser.name}</h6>
                        )}
                    </>
                )}
            </div>

            <ul className="nav flex-column px-2">
                                <li className="nav-item">
                    <Link to="/profile" className="nav-link text-white d-flex align-items-center">
                        <i className="bi bi-person me-2"></i>
                        {expanded && 'Mi Perfil'}
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/" className="nav-link text-white d-flex align-items-center">
                        <i className="bi bi-list-ul me-2"></i>
                        {expanded && 'Lista de Mascotas'}
                    </Link>
                </li>
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
    );
};

export default Sidebar;
