// Coin from /v2/coins
export interface SideShiftCoin {
    networks: string[];
    coin: string;
    name: string;
    hasMemo: boolean;
    fixedOnly: boolean | string[];
    variableOnly: boolean | string[];
    tokenDetails?: Record<string, {
        contractAddress: string;
        decimals: number;
    }>;
    networksWithMemo: string[];
    depositOffline?: boolean | string[];
    settleOffline?: boolean | string[];
}

// Pair info from /v2/pair
export interface SideShiftPair {
    min: string;
    max: string;
    rate: string;
    depositCoin: string;
    settleCoin: string;
    depositNetwork: string;
    settleNetwork: string;
}

// Permissions response
export interface SideShiftPermissions {
    createShift: boolean;
}

// Quote request
export interface QuoteRequest {
    depositCoin: string;
    depositNetwork: string;
    settleCoin: string;
    settleNetwork: string;
    depositAmount?: string;
    settleAmount?: string;
    affiliateId: string;
    commissionRate?: string;
}

// Quote response
export interface SideShiftQuote {
    id: string;
    createdAt: string;
    depositCoin: string;
    depositNetwork: string;
    settleCoin: string;
    settleNetwork: string;
    depositAmount: string;
    settleAmount: string;
    rate: string;
    expiresAt: string;
}

// Fixed shift request
export interface FixedShiftRequest {
    quoteId: string;
    settleAddress: string;
    affiliateId: string;
    settleMemo?: string;
    refundAddress?: string;
    refundMemo?: string;
}

// Shift response
export interface SideShiftShift {
    id: string;
    createdAt: string;
    depositCoin: string;
    settleCoin: string;
    depositNetwork: string;
    settleNetwork: string;
    depositAddress: string;
    settleAddress: string;
    depositMin: string;
    depositMax: string;
    refundAddress?: string;
    refundMemo?: string;
    type: 'fixed' | 'variable';
    quoteId?: string;
    depositAmount: string;
    settleAmount?: string;
    expiresAt: string;
    status: ShiftStatus;
    averageShiftSeconds?: string;
    updatedAt?: string;
    depositHash?: string;
    settleHash?: string;
    depositReceivedAt?: string;
    rate?: string;
    issue?: string;
    depositMemo?: string;
}

export type ShiftStatus =
    | 'waiting'
    | 'pending'
    | 'processing'
    | 'review'
    | 'settling'
    | 'settled'
    | 'refund'
    | 'refunding'
    | 'refunded'
    | 'expired'
    | 'multiple';

// Account info
export interface SideShiftAccount {
    id: string;
    createdAt: string;
    volume: {
        total: string;
        last24h: string;
        last7d: string;
        last30d: string;
    };
    commission: {
        total: string;
        pending: string;
    };
}

// XAI Stats
export interface SideShiftXaiStats {
    totalStaked: string;
    averageAnnualPercentageYield: string;
    circulatingSupply: string;
    totalValueLockedRatio: string;
    xaiPriceUsd: string;
}

// Error response
export interface SideShiftError {
    error: {
        message: string;
    };
}
