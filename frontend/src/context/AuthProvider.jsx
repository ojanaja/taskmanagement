import { createContext, useState, useContext, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) {
                    base64 += '=';
                }
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);

                // Handle roles if they are objects (Spring Security authorities)
                let roles = decoded.roles;
                if (Array.isArray(roles) && roles.length > 0 && typeof roles[0] === 'object') {
                    roles = roles.map(r => r.authority || JSON.stringify(r));
                }

                setUser({ username: decoded.sub, roles: roles });
            } catch (e) {
                console.error("Failed to decode token", e);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });
            const { accessToken, username: uname, roles } = response.data;
            setToken(accessToken);
            setUser({ username: uname, roles });
            localStorage.setItem('token', accessToken);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };


    const register = async (username, password, role) => {
        try {
            await api.post('/auth/register', {
                username,
                password,
                role
            });
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
