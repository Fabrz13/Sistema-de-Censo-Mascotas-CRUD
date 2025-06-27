import React, { useState } from 'react';
import Sidebar from './Sidebar';
import "../../styles/layout.css";

const MainLayout = ({ children }) => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    const toggleSidebar = () => {
        setSidebarExpanded(!sidebarExpanded);
    };

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