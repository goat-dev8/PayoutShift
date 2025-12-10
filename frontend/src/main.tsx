import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider } from './providers/WalletProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider>
            <WalletProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'var(--toast-bg)',
                            color: 'var(--toast-color)',
                            borderRadius: '12px',
                            border: '1px solid var(--toast-border)',
                        },
                    }}
                />
            </WalletProvider>
        </ThemeProvider>
    </StrictMode>
);

