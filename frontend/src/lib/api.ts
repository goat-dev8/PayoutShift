import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Variable to store the current wallet address
let currentWalletAddress: string | null = null;

// Function to set the wallet address (called from WalletProvider/hooks)
export function setWalletAddress(address: string | null) {
    currentWalletAddress = address?.toLowerCase() || null;
}

// Get current wallet address
export function getWalletAddress() {
    return currentWalletAddress;
}

// Add wallet address to requests
api.interceptors.request.use((config) => {
    if (currentWalletAddress) {
        config.headers['x-wallet-address'] = currentWalletAddress;
    }
    return config;
});

// Handle 401 responses - just reject, wallet connect UI will handle it
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Wallet address missing or invalid - let the UI handle reconnect
            console.warn('API 401: Wallet address required');
        }
        return Promise.reject(error);
    }
);

