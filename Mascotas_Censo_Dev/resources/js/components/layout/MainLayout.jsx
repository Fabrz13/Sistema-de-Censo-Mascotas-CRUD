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

  // ✅ FIX: En rutas de auth, NO aplicar estilos de main-content (padding/margin/offset)
  if (isAuthRoute) {
    return (
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
        {children}
      </div>
    );
  }

  return (
    <div className="main-layout">
      <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
