import { Schema, model } from 'mongoose';
import { IBatch, IRecipient, IClaim } from '../types';

// Batch Schema
const batchSchema = new Schema<IBatch>({
    batchId: { type: String, required: true, unique: true, index: true },
    ownerAddress: { type: String, required: true, index: true }, // Wallet address that owns this batch
    name: { type: String, required: true },
    description: { type: String },
    publicSlug: { type: String, required: true, unique: true, index: true },
    status: {
        type: String,
        enum: ['draft', 'prepared', 'awaiting-funding', 'funding-in-progress', 'completed', 'partially-completed', 'expired', 'failed'],
        default: 'draft',
    },

    // Treasury configuration
    treasuryCoin: { type: String, required: true },
    treasuryNetwork: { type: String, required: true },
    treasuryRefundAddress: { type: String },

    // Mode
    mode: { type: String, enum: ['csv-upload', 'claim-links'], required: true },
    fixedAmount: { type: Number },
    fixedAmountCurrency: { type: String },

    // Stats
    totalRecipients: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    totalSettled: { type: Number, default: 0 },

    // Timestamps
    preparedAt: { type: Date },
    fundedAt: { type: Date },
    completedAt: { type: Date },
}, {
    timestamps: true,
});

// Recipient Schema
const recipientSchema = new Schema<IRecipient>({
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },

    // Recipient info
    name: { type: String, required: true },
    handle: { type: String },

    // Payout details
    amount: { type: Number, required: true },
    amountCurrency: { type: String, required: true },
    settleCoin: { type: String, required: true },
    settleNetwork: { type: String, required: true },
    settleAddress: { type: String, required: true },
    settleMemo: { type: String },

    // Shift info
    shiftId: { type: String, index: true },
    depositAddress: { type: String },
    depositAmount: { type: String },
    depositMemo: { type: String },
    settleAmount: { type: String },
    expiresAt: { type: Date },

    // Status
    status: {
        type: String,
        enum: ['pending', 'validated', 'shift-created', 'funded', 'settled', 'failed', 'expired', 'refunded', 'cancelled'],
        default: 'pending',
    },
    error: { type: String },

    // TX info
    depositHash: { type: String },
    settleHash: { type: String },
    settledAt: { type: Date },
}, {
    timestamps: true,
});

// Compound index for batch + status queries
recipientSchema.index({ batchId: 1, status: 1 });

// Claim Schema
const claimSchema = new Schema<IClaim>({
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'Recipient' },

    // Claim token
    claimToken: { type: String, required: true, unique: true, index: true },

    // Recipient info (from sponsor)
    name: { type: String, required: true },
    handle: { type: String },
    amount: { type: Number, required: true },
    amountCurrency: { type: String, required: true },

    // Claimed info (from recipient)
    settleCoin: { type: String },
    settleNetwork: { type: String },
    settleAddress: { type: String },
    settleMemo: { type: String },

    // Status
    status: {
        type: String,
        enum: ['pending', 'claimed', 'shift-created', 'funded', 'settled', 'expired'],
        default: 'pending',
    },
    claimedAt: { type: Date },
    expiresAt: { type: Date },
}, {
    timestamps: true,
});

export const Batch = model<IBatch>('Batch', batchSchema);
export const Recipient = model<IRecipient>('Recipient', recipientSchema);
export const Claim = model<IClaim>('Claim', claimSchema);
