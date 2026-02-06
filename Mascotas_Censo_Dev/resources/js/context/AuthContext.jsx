import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // ✅ CAMBIO: token como estado (para detectar cambios y recargar usuario)
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

    // ✅ CAMBIO: en vez de correr solo 1 vez, corre cada vez que cambie el token
    useEffect(() => {
        if (token) {
            setLoading(true);
            fetchUser();
        } else {
            setCurrentUser(null);
            setLoading(false);
        }
    }, [token, fetchUser]);

    // ✅ NUEVO: login centralizado (guarda token y fuerza recarga de usuario)
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

    /**
     * ✅ NUEVO: logout best-effort al cerrar pestaña
     * (el navegador no garantiza 100% que llegue, pero keepalive es lo mejor)
     */
    const logoutOnTabClose = useCallback(() => {
        const t = localStorage.getItem('token');
        if (!t) return;

        try {
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${t}`,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                keepalive: true,
                body: JSON.stringify({}),
            }).catch(() => {});
        } catch (e) {
            // ignore
        } finally {
            // cerrar sesión local sí o sí
            localStorage.removeItem('token');
        }
    }, []);

    useEffect(() => {
        // solo registrar si hay token
        if (!token) return;

        const handleBeforeUnload = () => logoutOnTabClose();
        const handlePageHide = () => logoutOnTabClose();

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [token, logoutOnTabClose]);

    return (
        <AuthContext.Provider value={{
            token,
            currentUser,
            setCurrentUser,
            loading,
            fetchUser,
            loginWithToken, // ✅ expuesto para Login
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
