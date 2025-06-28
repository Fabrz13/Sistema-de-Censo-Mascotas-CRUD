import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUser = async () => {
        try {
            const response = await api.getCurrentOwner();
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
            setCurrentUser(null);
            localStorage.removeItem('token');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem('token');
            setCurrentUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ 
            currentUser, 
            setCurrentUser, // Asegúrate de incluir esto
            loading, 
            fetchUser, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);