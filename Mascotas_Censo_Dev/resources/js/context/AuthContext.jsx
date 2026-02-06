import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // token como estado (para detectar cambios y recargar usuario)
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.getCurrentOwner();
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
            setCurrentUser(null);

            // si falla, asumimos token inválido
            localStorage.removeItem('token');
            setToken(null);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // corre cada vez que cambie el token
    useEffect(() => {
        if (token) {
            setLoading(true);
            fetchUser();
        } else {
            setCurrentUser(null);
            setLoading(false);
        }
    }, [token, fetchUser]);

    // login centralizado (guarda token y fuerza recarga de usuario)
    const loginWithToken = async (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken); // dispara useEffect -> fetchUser()
        navigate('/');
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setCurrentUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{
            token,
            currentUser,
            setCurrentUser,
            loading,
            fetchUser,
            loginWithToken,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
