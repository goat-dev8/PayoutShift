import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token
        const token = localStorage.getItem('payoutshift-token');
        if (token) {
            // Verify token
            api.get('/auth/verify')
                .then(() => {
                    setIsAuthenticated(true);
                })
                .catch(() => {
                    localStorage.removeItem('payoutshift-token');
                    setIsAuthenticated(false);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (password: string) => {
        const response = await api.post('/auth/login', { password });
        const { token } = response.data.data;
        localStorage.setItem('payoutshift-token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('payoutshift-token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
