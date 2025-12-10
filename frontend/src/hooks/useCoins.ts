import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Coin {
    coin: string;
    name: string;
    networks: string[];
    hasMemo: boolean;
    networksWithMemo: string[];
    fixedOnly: boolean | string[];
    depositOffline?: boolean | string[];
    settleOffline?: boolean | string[];
}

export interface Pair {
    min: string;
    max: string;
    rate: string;
    depositCoin: string;
    settleCoin: string;
    depositNetwork: string;
    settleNetwork: string;
}

export function useCoins() {
    return useQuery({
        queryKey: ['coins'],
        queryFn: async () => {
            const response = await api.get('/coins');
            return response.data.data as Coin[];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function usePermissions() {
    return useQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
            const response = await api.get('/coins/permissions');
            return response.data.data as { createShift: boolean };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function usePair(from: string, to: string, amount?: number) {
    return useQuery({
        queryKey: ['pair', from, to, amount],
        queryFn: async () => {
            const params = amount ? `?amount=${amount}` : '';
            const response = await api.get(`/coins/pair/${from}/${to}${params}`);
            return response.data.data as Pair;
        },
        enabled: !!from && !!to,
        staleTime: 1000 * 30, // 30 seconds
    });
}
