import { Document, Types } from 'mongoose';

// Batch status
export type BatchStatus =
    | 'draft'
    | 'prepared'
    | 'awaiting-funding'
    | 'funding-in-progress'
    | 'completed'
    | 'partially-completed'
    | 'expired'
    | 'failed';

// Recipient status
export type RecipientStatus =
    | 'pending'
    | 'validated'
    | 'shift-created'
    | 'funded'
    | 'settled'
    | 'failed'
    | 'expired'
    | 'refunded'
    | 'cancelled';

// Claim status
export type ClaimStatus =
    | 'pending'
    | 'claimed'
    | 'shift-created'
    | 'funded'
    | 'settled'
    | 'expired';

// Batch document
export interface IBatch extends Document {
    _id: Types.ObjectId;
    batchId: string;
    ownerAddress: string; // Wallet address that owns this batch
    name: string;
    description?: string;
    publicSlug: string;
    status: BatchStatus;

    // Treasury configuration
    treasuryCoin: string;
    treasuryNetwork: string;
    treasuryRefundAddress?: string;

    // Mode
    mode: 'csv-upload' | 'claim-links';
    fixedAmount?: number;
    fixedAmountCurrency?: string;

    // Stats
    totalRecipients: number;
    totalAmount: number;
    totalSettled: number;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    preparedAt?: Date;
    fundedAt?: Date;
    completedAt?: Date;
}

// Recipient document
export interface IRecipient extends Document {
    _id: Types.ObjectId;
    batchId: Types.ObjectId;

    // Recipient info
    name: string;
    handle?: string;

    // Payout details
    amount: number;
    amountCurrency: string;
    settleCoin: string;
    settleNetwork: string;
    settleAddress: string;
    settleMemo?: string;

    // Shift info
    shiftId?: string;
    depositAddress?: string;
    depositAmount?: string;
    depositMemo?: string;
    settleAmount?: string;
    expiresAt?: Date;

    // Status
    status: RecipientStatus;
    error?: string;

    // TX info
    depositHash?: string;
    settleHash?: string;
    settledAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

// Claim document (for claim links mode)
export interface IClaim extends Document {
    _id: Types.ObjectId;
    batchId: Types.ObjectId;
    recipientId?: Types.ObjectId;

    // Claim token
    claimToken: string;

    // Recipient info (from sponsor)
    name: string;
    handle?: string;
    amount: number;
    amountCurrency: string;

    // Claimed info (from recipient)
    settleCoin?: string;
    settleNetwork?: string;
    settleAddress?: string;
    settleMemo?: string;

    // Status
    status: ClaimStatus;
    claimedAt?: Date;
    expiresAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

// API response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
