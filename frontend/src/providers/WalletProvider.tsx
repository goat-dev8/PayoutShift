import '@rainbow-me/rainbowkit/styles.css';
import { useEffect } from 'react';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount } from 'wagmi';
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setWalletAddress } from '../lib/api';

// Create wagmi config
const config = getDefaultConfig({
    appName: 'PayoutShift',
    projectId: '3c62108d60423fb1dd7f739662a118f9', // WalletConnect Cloud project ID
    chains: [mainnet, polygon, arbitrum, optimism, base],
    ssr: false,
});

// Create react-query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

interface WalletProviderProps {
    children: React.ReactNode;
}

// Component to sync wallet address to API client
function WalletSync({ children }: { children: React.ReactNode }) {
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (isConnected && address) {
            setWalletAddress(address);
        } else {
            setWalletAddress(null);
        }
    }, [address, isConnected]);

    return <>{children}</>;
}

export function WalletProvider({ children }: WalletProviderProps) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#f97316', // Orange - matches our primary color
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                        fontStack: 'system',
                        overlayBlur: 'small',
                    })}
                    modalSize="compact"
                >
                    <WalletSync>
                        {children}
                    </WalletSync>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

