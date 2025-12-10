import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Batch {
    _id: string;
    batchId: string;
    name: string;
    description?: string;
    publicSlug: string;
    status: 'draft' | 'prepared' | 'awaiting-funding' | 'funding-in-progress' | 'completed' | 'partially-completed' | 'failed';
    treasuryCoin: string;
    treasuryNetwork: string;
    treasuryRefundAddress?: string;
    mode: 'csv-upload' | 'claim-links';
    fixedAmount?: number;
    fixedAmountCurrency?: string;
    totalRecipients: number;
    totalAmount: number;
    totalSettled: number;
    createdAt: string;
    updatedAt: string;
    preparedAt?: string;
    completedAt?: string;
    recipients?: Recipient[];
    claims?: Claim[];
}

export interface Recipient {
    _id: string;
    name: string;
    handle?: string;
    amount: number;
    amountCurrency: string;
    settleCoin: string;
    settleNetwork: string;
    settleAddress: string;
    settleMemo?: string;
    shiftId?: string;
    depositAddress?: string;
    depositAmount?: string;
    settleAmount?: string;
    expiresAt?: string;
    status: string;
    error?: string;
    depositHash?: string;
    settleHash?: string;
    settledAt?: string;
}

export interface Claim {
    _id: string;
    claimToken: string;
    name: string;
    handle?: string;
    amount: number;
    amountCurrency: string;
    settleCoin?: string;
    settleNetwork?: string;
    settleAddress?: string;
    status: string;
    claimedAt?: string;
}

export function useBatches() {
    return useQuery({
        queryKey: ['batches'],
        queryFn: async () => {
            const response = await api.get('/batches');
            return response.data.data as Batch[];
        },
    });
}

export function useBatch(id: string) {
    return useQuery({
        queryKey: ['batch', id],
        queryFn: async () => {
            const response = await api.get(`/batches/${id}`);
            return response.data.data as Batch;
        },
        enabled: !!id,
    });
}

export function useCreateBatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            name: string;
            description?: string;
            treasuryCoin: string;
            treasuryNetwork: string;
            treasuryRefundAddress?: string;
            mode: 'csv-upload' | 'claim-links';
            fixedAmount?: number;
            fixedAmountCurrency?: string;
        }) => {
            const response = await api.post('/batches', data);
            return response.data.data as Batch;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
        },
    });
}

export function useUploadRecipients() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ batchId, csvContent }: { batchId: string; csvContent: string }) => {
            const response = await api.post(`/batches/${batchId}/recipients/csv`, { csvContent });
            return response.data.data;
        },
        onSuccess: (_, { batchId }) => {
            queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
        },
    });
}

export function useCreateClaims() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ batchId, recipients }: {
            batchId: string;
            recipients: { name: string; handle?: string; amount: number; amountCurrency?: string }[]
        }) => {
            const response = await api.post(`/batches/${batchId}/claims`, { recipients });
            return response.data.data;
        },
        onSuccess: (_, { batchId }) => {
            queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
        },
    });
}

export function usePrepareBatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (batchId: string) => {
            const response = await api.post(`/batches/${batchId}/prepare`);
            return response.data.data;
        },
        onSuccess: (_, batchId) => {
            queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
            queryClient.invalidateQueries({ queryKey: ['batches'] });
        },
    });
}

export function useFundingInstructions(batchId: string) {
    return useQuery({
        queryKey: ['funding', batchId],
        queryFn: async () => {
            const response = await api.get(`/batches/${batchId}/funding`);
            return response.data.data;
        },
        enabled: !!batchId,
    });
}

export function useRefreshStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (batchId: string) => {
            const response = await api.post(`/batches/${batchId}/refresh-status`);
            return response.data.data;
        },
        onSuccess: (_, batchId) => {
            queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
            queryClient.invalidateQueries({ queryKey: ['batches'] });
        },
    });
}

export function usePublicBatch(slug: string) {
    return useQuery({
        queryKey: ['public-batch', slug],
        queryFn: async () => {
            const response = await api.get(`/batches/public/${slug}`);
            return response.data.data;
        },
        enabled: !!slug,
    });
}

export function useCancelRecipient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ batchId, recipientId }: { batchId: string; recipientId: string }) => {
            const response = await api.delete(`/batches/${batchId}/recipients/${recipientId}`);
            return response.data;
        },
        onSuccess: (_, { batchId }) => {
            queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
            queryClient.invalidateQueries({ queryKey: ['funding', batchId] });
            queryClient.invalidateQueries({ queryKey: ['batches'] });
        },
    });
}

