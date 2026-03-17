import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('nic_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('nic_user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        setToken(data.token);
        setUser({ id: data.id, username: data.username, email: data.email, role: data.role });
        localStorage.setItem('nic_token', data.token);
        localStorage.setItem('nic_user', JSON.stringify({ id: data.id, username: data.username, email: data.email, role: data.role }));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('nic_token');
        localStorage.removeItem('nic_user');
        localStorage.removeItem('userId');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
