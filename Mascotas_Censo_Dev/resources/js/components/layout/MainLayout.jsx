import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import "../../styles/layout.css";

const MainLayout = ({ children }) => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const location = useLocation();
    
    // Determinar si estamos en una ruta de autenticación
    const isAuthRoute = ['/login', '/register'].includes(location.pathname);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

    return (
        <div className="main-layout">
            {!isAuthRoute && (
                <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
            )}
            <div className={`main-content ${!isAuthRoute ? (sidebarExpanded ? 'expanded' : 'collapsed') : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default MainLayout;