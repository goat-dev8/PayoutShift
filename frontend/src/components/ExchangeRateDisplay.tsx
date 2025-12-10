import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface ExchangeRateDisplayProps {
    fromCoin?: string;
    toCoin?: string;
}

interface PairData {
    rate: string;
    min: string;
    max: string;
    depositCoin: string;
    settleCoin: string;
}

export function ExchangeRateDisplay({ fromCoin = 'USDC', toCoin = 'ETH' }: ExchangeRateDisplayProps) {
    const { data: pairData, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['exchangeRate', fromCoin, toCoin],
        queryFn: async () => {
            const res = await api.get(`/coins/pair/${fromCoin.toLowerCase()}/${toCoin.toLowerCase()}`);
            return res.data.data as PairData;
        },
        refetchInterval: 60000, // Refresh every minute
        staleTime: 30000, // Consider data stale after 30 seconds
    });

    if (isLoading) {
        return (
            <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 animate-pulse">
                <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded mb-2" />
                <div className="h-6 w-32 bg-surface-200 dark:bg-surface-700 rounded" />
            </div>
        );
    }

    if (!pairData) {
        return null;
    }

    const rate = parseFloat(pairData.rate);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-800/50 dark:to-surface-900/50 border border-surface-200 dark:border-surface-700"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                    Live Rate
                </span>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-surface-400 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                    1 {fromCoin.toUpperCase()}
                </span>
                <span className="text-surface-400">=</span>
                <span className="text-lg font-bold text-primary-500">
                    {rate.toFixed(6)} {toCoin.toUpperCase()}
                </span>
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs text-surface-500">
                <span>Min: {pairData.min}</span>
                <span>•</span>
                <span>Max: {pairData.max}</span>
            </div>
        </motion.div>
    );
}

// Popular pairs widget for homepage
export function PopularRates() {
    const pairs = [
        { from: 'usdc', to: 'eth', fromLabel: 'USDC', toLabel: 'ETH' },
        { from: 'btc', to: 'eth', fromLabel: 'BTC', toLabel: 'ETH' },
        { from: 'usdt', to: 'usdc', fromLabel: 'USDT', toLabel: 'USDC' },
    ];

    return (
        <div className="space-y-3">
            {pairs.map(({ from, to, fromLabel, toLabel }) => (
                <RatePill key={`${from}-${to}`} from={from} to={to} fromLabel={fromLabel} toLabel={toLabel} />
            ))}
        </div>
    );
}

function RatePill({ from, to, fromLabel, toLabel }: { from: string; to: string; fromLabel: string; toLabel: string }) {
    const { data: pairData, isLoading } = useQuery({
        queryKey: ['exchangeRate', from, to],
        queryFn: async () => {
            const res = await api.get(`/coins/pair/${from}/${to}`);
            return res.data.data as PairData;
        },
        refetchInterval: 60000,
    });

    if (isLoading) {
        return (
            <div className="h-10 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
        );
    }

    if (!pairData) return null;

    const rate = parseFloat(pairData.rate);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
            <span className="text-sm font-medium">
                {fromLabel} → {toLabel}
            </span>
            <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-primary-500">
                    {rate.toFixed(4)}
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-success-500" />
            </div>
        </motion.div>
    );
}
