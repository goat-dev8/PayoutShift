import { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Wallet, Sparkles } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isConnected, isConnecting } = useAccount();

    if (isConnecting) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent"
                />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-surface-200/50 dark:border-surface-700/50 text-center">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25"
                        >
                            <Wallet className="w-10 h-10 text-white" />
                        </motion.div>

                        <h1 className="text-2xl font-display font-bold mb-2">
                            Connect Your Wallet
                        </h1>
                        <p className="text-surface-600 dark:text-surface-400 mb-8">
                            Connect your wallet to access the PayoutShift dashboard and manage your cross-chain payouts.
                        </p>

                        <div className="flex justify-center">
                            <ConnectButton.Custom>
                                {({ openConnectModal, mounted }) => (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={openConnectModal}
                                        disabled={!mounted}
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Connect Wallet
                                    </motion.button>
                                )}
                            </ConnectButton.Custom>
                        </div>

                        <p className="mt-6 text-sm text-surface-500">
                            Supports MetaMask, WalletConnect, Coinbase & more
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}

