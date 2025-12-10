import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sun,
    Moon,
    LayoutDashboard,
    PlusCircle,
    BarChart3,
    Sparkles
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

interface LayoutProps {
    isAdmin?: boolean;
}

export function Layout({ isAdmin }: LayoutProps) {
    const { theme, toggleTheme } = useTheme();
    const { isConnected } = useAccount();
    const location = useLocation();

    const navLinks = isAdmin ? [
        { to: '/admin/batches', label: 'Batches', icon: LayoutDashboard },
        { to: '/admin/batches/new', label: 'New Batch', icon: PlusCircle },
        { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ] : [];

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-0 -left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-tl from-secondary-500/20 to-primary-500/20 blur-3xl"
                />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-surface-900/70 border-b border-surface-200/50 dark:border-surface-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo - Always goes to home */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary-500/25"
                            >
                                <img
                                    src="/logo.png"
                                    alt="PayoutShift"
                                    className="w-full h-full object-contain"
                                />
                                <motion.div
                                    animate={{ opacity: [0, 0.3, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-white/20"
                                />
                            </motion.div>
                            <span className="font-display font-bold text-xl">
                                <span className="gradient-text">Payout</span>
                                <span className="text-surface-700 dark:text-surface-200">Shift</span>
                            </span>
                        </Link>

                        {/* Nav Links (Admin) */}
                        {isAdmin && isConnected && (
                            <nav className="hidden md:flex items-center gap-1">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = location.pathname === link.to ||
                                        (link.to === '/admin/batches' && location.pathname === '/admin');

                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            className={clsx(
                                                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                                                isActive
                                                    ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-600 dark:text-primary-400 shadow-sm'
                                                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100/50 dark:hover:bg-surface-800/50'
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {/* Theme toggle */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl bg-surface-100/50 dark:bg-surface-800/50 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                                aria-label="Toggle theme"
                            >
                                <motion.div
                                    key={theme}
                                    initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </motion.div>
                            </motion.button>

                            {/* Wallet Connect Button */}
                            <ConnectButton.Custom>
                                {({
                                    account,
                                    chain,
                                    openAccountModal,
                                    openChainModal,
                                    openConnectModal,
                                    mounted,
                                }) => {
                                    const ready = mounted;
                                    const connected = ready && account && chain;

                                    return (
                                        <div
                                            {...(!ready && {
                                                'aria-hidden': true,
                                                style: {
                                                    opacity: 0,
                                                    pointerEvents: 'none',
                                                    userSelect: 'none',
                                                },
                                            })}
                                        >
                                            {(() => {
                                                if (!connected) {
                                                    return (
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={openConnectModal}
                                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-sm shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
                                                        >
                                                            <Sparkles className="w-4 h-4" />
                                                            Connect Wallet
                                                        </motion.button>
                                                    );
                                                }

                                                if (chain.unsupported) {
                                                    return (
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={openChainModal}
                                                            className="px-4 py-2.5 rounded-xl bg-error-500 text-white font-semibold text-sm"
                                                        >
                                                            Wrong network
                                                        </motion.button>
                                                    );
                                                }

                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={openChainModal}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-100/50 dark:bg-surface-800/50 text-sm font-medium"
                                                        >
                                                            {chain.hasIcon && (
                                                                <div className="w-5 h-5 rounded-full overflow-hidden">
                                                                    {chain.iconUrl && (
                                                                        <img
                                                                            alt={chain.name ?? 'Chain icon'}
                                                                            src={chain.iconUrl}
                                                                            className="w-5 h-5"
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                            {chain.name}
                                                        </motion.button>

                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={openAccountModal}
                                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 text-sm font-semibold border border-primary-500/20"
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500" />
                                                            {account.displayName}
                                                        </motion.button>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    );
                                }}
                            </ConnectButton.Custom>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-surface-200/50 dark:border-surface-800/50 py-8 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <p className="text-sm text-surface-500">
                            © 2025 PayoutShift. Powered by{' '}
                            <a
                                href="https://sideshift.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-500 hover:text-primary-600 transition-colors font-medium"
                            >
                                SideShift.ai
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

