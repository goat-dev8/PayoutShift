import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, Check } from 'lucide-react';
import { Coin } from '../../hooks/useCoins';

interface CoinSelectorProps {
    coins: Coin[];
    selectedCoin: string;
    selectedNetwork: string;
    onSelectCoin: (coin: string) => void;
    onSelectNetwork: (network: string) => void;
    placeholder?: string;
    className?: string;
}

export default function CoinSelector({
    coins,
    selectedCoin,
    selectedNetwork,
    onSelectCoin,
    onSelectNetwork,
    placeholder = 'Select asset',
    className = ''
}: CoinSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [showNetworks, setShowNetworks] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search on open
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Filter and sort coins based on search - prioritize exact matches
    const filteredCoins = useMemo(() => {
        if (!search) return coins;
        const searchLower = search.toLowerCase();
        const searchUpper = search.toUpperCase();

        // Filter coins that match
        const matches = coins.filter(coin =>
            coin.coin.toLowerCase().includes(searchLower) ||
            coin.name.toLowerCase().includes(searchLower) ||
            coin.networks.some(n => n.toLowerCase().includes(searchLower))
        );

        // Sort by relevance:
        // 1. Exact symbol match (SOL === SOL)
        // 2. Symbol starts with search (SOLA starts with SOL)
        // 3. Name starts with search
        // 4. Everything else
        return matches.sort((a, b) => {
            const aSymbol = a.coin.toUpperCase();
            const bSymbol = b.coin.toUpperCase();

            // Exact match gets highest priority
            if (aSymbol === searchUpper && bSymbol !== searchUpper) return -1;
            if (bSymbol === searchUpper && aSymbol !== searchUpper) return 1;

            // Symbol starts with search
            const aStartsWith = aSymbol.startsWith(searchUpper);
            const bStartsWith = bSymbol.startsWith(searchUpper);
            if (aStartsWith && !bStartsWith) return -1;
            if (bStartsWith && !aStartsWith) return 1;

            // Name starts with search
            const aNameStarts = a.name.toLowerCase().startsWith(searchLower);
            const bNameStarts = b.name.toLowerCase().startsWith(searchLower);
            if (aNameStarts && !bNameStarts) return -1;
            if (bNameStarts && !aNameStarts) return 1;

            // Alphabetical by symbol
            return aSymbol.localeCompare(bSymbol);
        });
    }, [coins, search]);

    // Get selected coin data
    const selectedCoinData = useMemo(() => {
        return coins.find(c => c.coin === selectedCoin);
    }, [coins, selectedCoin]);

    const handleSelectCoin = (coin: Coin) => {
        onSelectCoin(coin.coin);
        if (coin.networks.length === 1) {
            onSelectNetwork(coin.networks[0]);
            setIsOpen(false);
            setShowNetworks(false);
        } else {
            setShowNetworks(true);
        }
        setSearch('');
    };

    const handleSelectNetwork = (network: string) => {
        onSelectNetwork(network);
        setIsOpen(false);
        setShowNetworks(false);
    };

    const getCoinIcon = (coin: string, network: string) => {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
        return `${apiBase}/coins/icon/${coin.toLowerCase()}-${network.toLowerCase()}`;
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-surface-800 border-2 rounded-xl transition-all ${isOpen
                    ? 'border-primary-500 ring-4 ring-primary-500/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                    }`}
            >
                {selectedCoin && selectedCoinData ? (
                    <>
                        <img
                            src={getCoinIcon(selectedCoin, selectedNetwork || selectedCoinData.networks[0])}
                            alt={selectedCoin}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23666"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="30">' + selectedCoin[0] + '</text></svg>';
                            }}
                        />
                        <div className="flex-1 text-left">
                            <div className="font-semibold">{selectedCoin}</div>
                            {selectedNetwork && (
                                <div className="text-xs text-surface-500">{selectedNetwork}</div>
                            )}
                        </div>
                    </>
                ) : (
                    <span className="flex-1 text-left text-surface-400">{placeholder}</span>
                )}
                <ChevronDown className={`w-5 h-5 text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl overflow-hidden"
                    >
                        {/* Search */}
                        <div className="p-3 border-b border-surface-200 dark:border-surface-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search coins or networks..."
                                    className="w-full pl-10 pr-10 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-200 dark:hover:bg-surface-700 rounded"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Coin List or Network List */}
                        <div className="max-h-64 overflow-y-auto">
                            {!showNetworks ? (
                                // Coin List
                                <>
                                    {filteredCoins.length === 0 ? (
                                        <div className="p-4 text-center text-surface-500">
                                            No coins found
                                        </div>
                                    ) : (
                                        filteredCoins.slice(0, 50).map((coin, index) => (
                                            <motion.button
                                                key={coin.coin}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                onClick={() => handleSelectCoin(coin)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors ${selectedCoin === coin.coin ? 'bg-primary-500/10' : ''
                                                    }`}
                                            >
                                                <img
                                                    src={getCoinIcon(coin.coin, coin.networks[0])}
                                                    alt={coin.coin}
                                                    className="w-8 h-8 rounded-full"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23666"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="30">' + coin.coin[0] + '</text></svg>';
                                                    }}
                                                />
                                                <div className="flex-1 text-left">
                                                    <div className="font-medium">{coin.coin}</div>
                                                    <div className="text-xs text-surface-500">{coin.name}</div>
                                                </div>
                                                <div className="text-xs text-surface-400">
                                                    {coin.networks.length} network{coin.networks.length !== 1 ? 's' : ''}
                                                </div>
                                                {selectedCoin === coin.coin && (
                                                    <Check className="w-4 h-4 text-primary-500" />
                                                )}
                                            </motion.button>
                                        ))
                                    )}
                                </>
                            ) : (
                                // Network List
                                <>
                                    <div className="px-4 py-2 bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
                                        <button
                                            onClick={() => setShowNetworks(false)}
                                            className="text-sm text-primary-500 hover:text-primary-600"
                                        >
                                            ← Back to coins
                                        </button>
                                    </div>
                                    <div className="p-2">
                                        <div className="text-xs text-surface-500 px-2 py-1 mb-2">
                                            Select network for {selectedCoin}
                                        </div>
                                        {selectedCoinData?.networks.map((network, index) => (
                                            <motion.button
                                                key={network}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                onClick={() => handleSelectNetwork(network)}
                                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors ${selectedNetwork === network ? 'bg-primary-500/10' : ''
                                                    }`}
                                            >
                                                <img
                                                    src={getCoinIcon(selectedCoin, network)}
                                                    alt={network}
                                                    className="w-7 h-7 rounded-full"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23666"/></svg>';
                                                    }}
                                                />
                                                <span className="flex-1 text-left font-medium capitalize">{network}</span>
                                                {selectedNetwork === network && (
                                                    <Check className="w-4 h-4 text-primary-500" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
