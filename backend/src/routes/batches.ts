import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { CONFIG } from '../config';
import { Batch, Recipient, Claim } from '../database';
import { sideshift } from '../services/sideshift';
import {
    getUserIp,
    validateAddress,
    generateBatchId,
    generatePublicSlug,
    generateClaimToken,
    parseCSV
} from '../utils';
import { IRecipient } from '../types';

const router = Router();

// Helper to check if string is a valid MongoDB ObjectId
function isValidObjectId(str: string): boolean {
    return mongoose.Types.ObjectId.isValid(str) &&
        String(new mongoose.Types.ObjectId(str)) === str;
}

// Helper to build batch query that works with both _id and batchId
function buildBatchQuery(id: string) {
    if (isValidObjectId(id)) {
        return { $or: [{ _id: id }, { batchId: id }] };
    }
    return { batchId: id };
}


// Extended request with wallet address
interface AuthRequest extends Request {
    walletAddress?: string;
}

// Auth middleware - requires wallet address in header
function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const walletAddress = req.headers['x-wallet-address'] as string;

    if (!walletAddress || !walletAddress.startsWith('0x')) {
        return res.status(401).json({
            success: false,
            error: 'Wallet address required. Please connect your wallet.',
        });
    }

    // Store wallet address in request for use in routes
    req.walletAddress = walletAddress.toLowerCase();
    next();
}

// GET /api/batches - List batches owned by the connected wallet
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const batches = await Batch.find({ ownerAddress: req.walletAddress })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json({ success: true, data: batches });
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch batches',
        });
    }
});

// POST /api/batches - Create a new batch owned by the connected wallet
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const {
            name,
            description,
            treasuryCoin,
            treasuryNetwork,
            treasuryRefundAddress,
            mode,
            fixedAmount,
            fixedAmountCurrency,
        } = req.body;

        // Validate required fields
        if (!name || !treasuryCoin || !treasuryNetwork || !mode) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, treasuryCoin, treasuryNetwork, mode',
            });
        }

        // Check permissions (skip in development if no FORCE_USER_IP is set)
        // SideShift API rejects localhost IPs
        if (CONFIG.nodeEnv !== 'development' || CONFIG.forceUserIp) {
            const userIp = getUserIp(req);
            try {
                const permissions = await sideshift.checkPermissions(userIp);
                if (!permissions.createShift) {
                    return res.status(403).json({
                        success: false,
                        error: 'PayoutShift cannot be used from this region due to SideShift restrictions.',
                    });
                }
            } catch (permError) {
                console.warn('Permissions check failed, proceeding anyway:', permError);
                // Continue creating batch - will fail at shift creation if actually blocked
            }
        }

        const batch = new Batch({
            batchId: generateBatchId(),
            ownerAddress: req.walletAddress, // Associate batch with wallet
            name,
            description,
            publicSlug: generatePublicSlug(),
            status: 'draft',
            treasuryCoin: treasuryCoin.toUpperCase(),
            treasuryNetwork: treasuryNetwork.toLowerCase(),
            treasuryRefundAddress,
            mode,
            fixedAmount,
            fixedAmountCurrency,
        });

        await batch.save();

        res.status(201).json({
            success: true,
            data: batch,
        });
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create batch',
        });
    }
});

// GET /api/batches/:id - Get batch details
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const batch = await Batch.findOne(buildBatchQuery(req.params.id)).lean();

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        // Get recipients
        const recipients = await Recipient.find({ batchId: batch._id }).lean();

        // Get claims if claim-links mode
        let claims: unknown[] = [];
        if (batch.mode === 'claim-links') {
            claims = await Claim.find({ batchId: batch._id }).lean();
        }

        res.json({
            success: true,
            data: {
                ...batch,
                recipients,
                claims,
            },
        });
    } catch (error) {
        console.error('Error fetching batch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch batch',
        });
    }
});

// POST /api/batches/:id/recipients/csv - Upload recipients via CSV
router.post('/:id/recipients/csv', requireAuth, async (req: Request, res: Response) => {
    try {
        const batch = await Batch.findOne(buildBatchQuery(req.params.id));

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        if (batch.status !== 'draft') {
            return res.status(400).json({
                success: false,
                error: 'Can only add recipients to draft batches',
            });
        }

        const { csvContent } = req.body;

        if (!csvContent) {
            return res.status(400).json({
                success: false,
                error: 'CSV content is required',
            });
        }

        // Parse CSV
        const rows = parseCSV(csvContent);

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid rows in CSV',
            });
        }

        // Validate and create recipients
        const validRecipients: Partial<IRecipient>[] = [];
        const errors: { row: number; error: string }[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // +2 for header and 1-indexing

            // Required fields
            if (!row.name) {
                errors.push({ row: rowNum, error: 'Missing name' });
                continue;
            }

            if (!row.amount || isNaN(parseFloat(row.amount))) {
                errors.push({ row: rowNum, error: 'Invalid amount' });
                continue;
            }

            if (!row.settlecoin) {
                errors.push({ row: rowNum, error: 'Missing settleCoin' });
                continue;
            }

            if (!row.settlenetwork) {
                errors.push({ row: rowNum, error: 'Missing settleNetwork' });
                continue;
            }

            // Accept both walletAddress and settleAddress column names
            const walletAddress = row.walletaddress || row.settleaddress;
            if (!walletAddress) {
                errors.push({ row: rowNum, error: 'Missing walletAddress or settleAddress column' });
                continue;
            }

            // Validate address
            const addressValidation = validateAddress(walletAddress, row.settlenetwork);
            if (!addressValidation.valid) {
                errors.push({ row: rowNum, error: addressValidation.error || 'Invalid address' });
                continue;
            }

            validRecipients.push({
                batchId: batch._id,
                name: row.name,
                handle: row.handle || undefined,
                amount: parseFloat(row.amount),
                amountCurrency: row.amountcurrency || batch.treasuryCoin,
                settleCoin: row.settlecoin.toUpperCase(),
                settleNetwork: row.settlenetwork.toLowerCase(),
                settleAddress: walletAddress,
                settleMemo: row.memo || undefined,
                status: 'pending',
            });
        }

        if (validRecipients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid recipients in CSV',
                details: errors,
            });
        }

        // Insert recipients
        const inserted = await Recipient.insertMany(validRecipients);

        // Update batch stats
        const totalAmount = validRecipients.reduce((sum, r) => sum + (r.amount || 0), 0);
        batch.totalRecipients = (batch.totalRecipients || 0) + validRecipients.length;
        batch.totalAmount = (batch.totalAmount || 0) + totalAmount;
        await batch.save();

        res.json({
            success: true,
            data: {
                added: inserted.length,
                errors: errors.length > 0 ? errors : undefined,
            },
        });
    } catch (error) {
        console.error('Error uploading recipients:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload recipients',
        });
    }
});

// POST /api/batches/:id/claims - Create claim links
router.post('/:id/claims', requireAuth, async (req: Request, res: Response) => {
    try {
        const batch = await Batch.findOne(buildBatchQuery(req.params.id));

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        if (batch.mode !== 'claim-links') {
            return res.status(400).json({
                success: false,
                error: 'Batch is not in claim-links mode',
            });
        }

        const { recipients } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Recipients array is required',
            });
        }

        const claims = recipients.map((r: { name: string; handle?: string; amount: number; amountCurrency?: string }) => ({
            batchId: batch._id,
            claimToken: generateClaimToken(),
            name: r.name,
            handle: r.handle,
            amount: r.amount,
            amountCurrency: r.amountCurrency || batch.fixedAmountCurrency || 'USD',
            status: 'pending',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }));

        const inserted = await Claim.insertMany(claims);

        // Generate claim URLs
        const claimUrls = inserted.map((c) => ({
            name: c.name,
            handle: c.handle,
            amount: c.amount,
            amountCurrency: c.amountCurrency,
            claimUrl: `${CONFIG.appBaseUrl}/claim/${c.claimToken}`,
        }));

        // Update batch stats
        batch.totalRecipients = (batch.totalRecipients || 0) + claims.length;
        batch.totalAmount = (batch.totalAmount || 0) + claims.reduce((sum, c) => sum + c.amount, 0);
        await batch.save();

        res.json({
            success: true,
            data: claimUrls,
        });
    } catch (error) {
        console.error('Error creating claims:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create claims',
        });
    }
});

// POST /api/batches/:id/prepare - Prepare shifts for all recipients
router.post('/:id/prepare', requireAuth, async (req: Request, res: Response) => {
    try {
        const batch = await Batch.findOne(buildBatchQuery(req.params.id));

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        if (batch.status !== 'draft') {
            return res.status(400).json({
                success: false,
                error: 'Batch has already been prepared or is in progress',
            });
        }

        const recipients = await Recipient.find({
            batchId: batch._id,
            status: { $in: ['pending', 'validated'] },
        });

        if (recipients.length === 0) {
            // For claim-links mode, check if there are unclaimed claims
            if (batch.mode === 'claim-links') {
                const pendingClaims = await Claim.countDocuments({
                    batchId: batch._id,
                    status: 'pending'
                });

                if (pendingClaims > 0) {
                    return res.status(400).json({
                        success: false,
                        error: `No claimed recipients yet. ${pendingClaims} recipient(s) need to claim their links first before you can prepare shifts. Share the claim links and wait for recipients to submit their wallet addresses.`,
                    });
                }
            }

            return res.status(400).json({
                success: false,
                error: 'No pending recipients to prepare',
            });
        }

        const userIp = getUserIp(req);
        let prepared = 0;
        let failed = 0;
        const errors: { name: string; error: string }[] = [];

        // Process recipients one by one with rate limiting
        for (const recipient of recipients) {
            try {
                // Validate pair first
                const from = `${batch.treasuryCoin.toLowerCase()}-${batch.treasuryNetwork}`;
                const to = `${recipient.settleCoin.toLowerCase()}-${recipient.settleNetwork}`;

                const pair = await sideshift.getPair(from, to, recipient.amount);

                // Check amount is within limits
                const min = parseFloat(pair.min);
                const max = parseFloat(pair.max);

                if (recipient.amount < min) {
                    throw new Error(`Amount ${recipient.amount} is below minimum ${min}`);
                }

                if (recipient.amount > max) {
                    throw new Error(`Amount ${recipient.amount} is above maximum ${max}`);
                }

                // Request quote
                const quote = await sideshift.requestQuote({
                    depositCoin: batch.treasuryCoin,
                    depositNetwork: batch.treasuryNetwork,
                    settleCoin: recipient.settleCoin,
                    settleNetwork: recipient.settleNetwork,
                    depositAmount: String(recipient.amount),
                    affiliateId: CONFIG.sideshift.affiliateId,
                }, userIp);

                // Create shift
                const shift = await sideshift.createFixedShift({
                    quoteId: quote.id,
                    settleAddress: recipient.settleAddress,
                    affiliateId: CONFIG.sideshift.affiliateId,
                    settleMemo: recipient.settleMemo,
                    refundAddress: batch.treasuryRefundAddress,
                }, userIp);

                // Update recipient
                recipient.shiftId = shift.id;
                recipient.depositAddress = shift.depositAddress;
                recipient.depositAmount = shift.depositAmount;
                recipient.depositMemo = shift.depositMemo;
                recipient.settleAmount = shift.settleAmount;
                recipient.expiresAt = new Date(shift.expiresAt);
                recipient.status = 'shift-created';
                await recipient.save();

                prepared++;

                // Small delay between shifts to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error: unknown) {
                const err = error as Error;
                console.error(`Error preparing shift for ${recipient.name}:`, err.message);

                recipient.status = 'failed';
                recipient.error = err.message;
                await recipient.save();

                failed++;
                errors.push({ name: recipient.name, error: err.message });
            }
        }

        // Update batch status
        if (prepared > 0) {
            batch.status = 'prepared';
            batch.preparedAt = new Date();
        }
        if (failed === recipients.length) {
            batch.status = 'failed';
        }
        await batch.save();

        res.json({
            success: true,
            data: {
                prepared,
                failed,
                errors: errors.length > 0 ? errors : undefined,
            },
        });
    } catch (error) {
        console.error('Error preparing batch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to prepare batch',
        });
    }
});

// GET /api/batches/:id/funding - Get funding instructions
router.get('/:id/funding', requireAuth, async (req: Request, res: Response) => {
    try {
        const batch = await Batch.findOne(buildBatchQuery(req.params.id)).lean();

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        const recipients = await Recipient.find({
            batchId: batch._id,
            status: 'shift-created',
        }).lean();

        if (recipients.length === 0) {
            return res.json({
                success: true,
                data: {
                    treasuryCoin: batch.treasuryCoin,
                    treasuryNetwork: batch.treasuryNetwork,
                    totalAmount: '0',
                    recipientCount: 0,
                    recipients: [],
                    safeTransactions: [],
                    message: 'No active shifts to fund',
                },
            });
        }

        // Generate funding data
        const fundingData = recipients.map((r) => ({
            name: r.name,
            handle: r.handle,
            shiftId: r.shiftId,
            depositAddress: r.depositAddress,
            depositAmount: r.depositAmount,
            depositMemo: r.depositMemo,
            settleCoin: r.settleCoin,
            settleNetwork: r.settleNetwork,
            settleAmount: r.settleAmount,
            expiresAt: r.expiresAt,
        }));

        // Calculate totals
        const totalDeposit = fundingData.reduce(
            (sum, r) => sum + parseFloat(r.depositAmount || '0'),
            0
        );

        // Generate Safe-compatible JSON for multi-send
        const safeTransactions = fundingData.map((r) => ({
            to: r.depositAddress,
            value: '0',
            data: null,
        }));

        res.json({
            success: true,
            data: {
                treasuryCoin: batch.treasuryCoin,
                treasuryNetwork: batch.treasuryNetwork,
                totalAmount: totalDeposit.toFixed(6),
                recipientCount: fundingData.length,
                recipients: fundingData,
                safeTransactions,
            },
        });
    } catch (error) {
        console.error('Error getting funding instructions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get funding instructions',
        });
    }
});

// POST /api/batches/:id/refresh-status - Refresh shift statuses
router.post('/:id/refresh-status', requireAuth, async (req: Request, res: Response) => {
    try {
        const batch = await Batch.findOne(buildBatchQuery(req.params.id));

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        // Also mark locally expired recipients (expiresAt passed)
        const expiredLocally = await Recipient.updateMany(
            {
                batchId: batch._id,
                status: { $in: ['shift-created', 'waiting'] },
                expiresAt: { $lte: new Date() },
            },
            { $set: { status: 'expired', error: 'Shift expired' } }
        );

        let expiredCount = expiredLocally.modifiedCount || 0;

        // Find recipients with shifts that need status check from SideShift
        const recipients = await Recipient.find({
            batchId: batch._id,
            shiftId: { $exists: true, $ne: null },
            status: { $nin: ['settled', 'refunded', 'expired', 'cancelled', 'failed'] },
        });

        let updated = 0;
        let settled = 0;

        if (recipients.length > 0) {
            // Fetch shifts in bulk
            const shiftIds = recipients.map((r) => r.shiftId!);
            const shifts = await sideshift.getShiftsBulk(shiftIds);

            // Create a map for quick lookup
            const shiftMap = new Map(shifts.map((s) => [s.id, s]));

            for (const recipient of recipients) {
                const shift = shiftMap.get(recipient.shiftId!);

                if (!shift) continue;

                let newStatus = recipient.status;

                switch (shift.status) {
                    case 'waiting':
                        // Still waiting for deposit - check if expired locally
                        if (recipient.expiresAt && new Date() > recipient.expiresAt) {
                            newStatus = 'expired';
                            expiredCount++;
                        }
                        break;
                    case 'pending':
                    case 'processing':
                        newStatus = 'funded';
                        break;
                    case 'settling':
                        newStatus = 'funded';
                        break;
                    case 'settled':
                        newStatus = 'settled';
                        settled++;
                        break;
                    case 'refunded':
                        newStatus = 'refunded';
                        break;
                    case 'expired':
                        newStatus = 'expired';
                        expiredCount++;
                        break;
                }

                if (newStatus !== recipient.status) {
                    recipient.status = newStatus;
                    recipient.depositHash = shift.depositHash;
                    recipient.settleHash = shift.settleHash;
                    if (shift.status === 'settled') {
                        recipient.settledAt = new Date();
                    }
                    if (newStatus === 'expired') {
                        recipient.error = 'Shift expired';
                    }
                    await recipient.save();
                    updated++;
                }
            }
        }

        // Update batch stats
        batch.totalSettled = await Recipient.countDocuments({
            batchId: batch._id,
            status: 'settled',
        });

        // Check if batch is complete - include cancelled in terminal states
        const activeCount = await Recipient.countDocuments({
            batchId: batch._id,
            status: { $nin: ['settled', 'refunded', 'expired', 'failed', 'cancelled'] },
        });

        if (activeCount === 0) {
            // No more active recipients - determine final status
            if (batch.totalSettled > 0) {
                batch.status = batch.totalSettled >= batch.totalRecipients ? 'completed' : 'partially-completed';
            } else {
                // Check if all recipients expired (vs other failure reasons)
                const expiredRecipientsCount = await Recipient.countDocuments({
                    batchId: batch._id,
                    status: 'expired',
                });
                const totalRecipientsInBatch = await Recipient.countDocuments({
                    batchId: batch._id,
                });

                if (expiredRecipientsCount > 0 && expiredRecipientsCount === totalRecipientsInBatch) {
                    batch.status = 'expired'; // All recipients expired
                } else {
                    batch.status = 'failed'; // Some failed or cancelled
                }
            }
            batch.completedAt = new Date();
        } else if (settled > 0 || (updated > 0 && !['failed', 'expired'].includes(batch.status))) {
            batch.status = 'funding-in-progress';
        }

        await batch.save();

        res.json({
            success: true,
            data: {
                updated,
                settled,
                expired: expiredCount,
                totalSettled: batch.totalSettled,
                status: batch.status,
            },
        });
    } catch (error) {
        console.error('Error refreshing status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh status',
        });
    }
});

// GET /api/batches/public/:slug - Public proof page
router.get('/public/:slug', async (req: Request, res: Response) => {
    try {
        const batch = await Batch.findOne({
            publicSlug: req.params.slug,
        }).lean();

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        const recipients = await Recipient.find({
            batchId: batch._id,
        }).select('name handle settleCoin settleNetwork settleAmount status settledAt settleHash').lean();

        res.json({
            success: true,
            data: {
                name: batch.name,
                description: batch.description,
                status: batch.status,
                treasuryCoin: batch.treasuryCoin,
                treasuryNetwork: batch.treasuryNetwork,
                totalRecipients: batch.totalRecipients,
                totalSettled: batch.totalSettled,
                createdAt: batch.createdAt,
                completedAt: batch.completedAt,
                recipients: recipients.map((r) => ({
                    name: r.name,
                    handle: r.handle,
                    settleCoin: r.settleCoin,
                    settleNetwork: r.settleNetwork,
                    settleAmount: r.settleAmount,
                    status: r.status,
                    settledAt: r.settledAt,
                    settleHash: r.settleHash,
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching public batch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch batch',
        });
    }
});

// Cancel/delete a recipient
router.delete('/:id/recipients/:recipientId', requireAuth, async (req: Request, res: Response) => {
    try {
        const batch = await Batch.findOne(buildBatchQuery(req.params.id));

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        const recipient = await Recipient.findOne({
            _id: req.params.recipientId,
            batchId: batch._id,
        });

        if (!recipient) {
            return res.status(404).json({
                success: false,
                error: 'Recipient not found',
            });
        }

        // Check if recipient can be cancelled
        const cancellableStatuses = ['pending', 'shift-created', 'waiting', 'quote-ready'];
        if (!cancellableStatuses.includes(recipient.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel recipient with status: ${recipient.status}`,
            });
        }

        // If has a shift ID, try to cancel on SideShift
        if (recipient.shiftId) {
            try {
                await sideshift.cancelOrder(recipient.shiftId);
                console.log('[Batches] Cancelled shift on SideShift:', recipient.shiftId);
            } catch (ssError: unknown) {
                // SideShift may reject cancel if < 5 minutes old or already processed
                const axiosError = ssError as { response?: { data?: { error?: { message?: string } } } };
                const errorMsg = axiosError.response?.data?.error?.message || 'Unknown error';
                console.warn('[Batches] SideShift cancel failed:', errorMsg);

                // Check if it's a "too early" error
                if (errorMsg.includes('5 minutes')) {
                    return res.status(400).json({
                        success: false,
                        error: 'Orders can only be cancelled after 5 minutes. Please wait and try again.',
                    });
                }

                // For other errors (already expired, etc), we can still mark as cancelled locally
                console.log('[Batches] Proceeding with local cancellation despite SideShift error');
            }
        }

        // Update recipient status
        recipient.status = 'cancelled';
        recipient.error = 'Cancelled by admin';
        await recipient.save();

        // Check if all recipients are now cancelled/expired/failed
        const activeRecipients = await Recipient.countDocuments({
            batchId: batch._id,
            status: { $in: ['pending', 'validated', 'shift-created', 'funded', 'waiting'] }
        });

        const settledRecipients = await Recipient.countDocuments({
            batchId: batch._id,
            status: 'settled'
        });

        // Update batch status based on remaining recipients
        if (activeRecipients === 0) {
            if (settledRecipients > 0) {
                batch.status = 'partially-completed';
            } else {
                // Check if all recipients expired (vs cancelled or failed)
                const expiredRecipientsCount = await Recipient.countDocuments({
                    batchId: batch._id,
                    status: 'expired',
                });
                const totalRecipientsInBatch = await Recipient.countDocuments({
                    batchId: batch._id,
                });

                if (expiredRecipientsCount > 0 && expiredRecipientsCount === totalRecipientsInBatch) {
                    batch.status = 'expired';
                } else {
                    batch.status = 'failed';
                }
            }
            batch.completedAt = new Date();
        }
        await batch.save();

        console.log('[Batches] Recipient cancelled:', recipient._id, 'Batch status:', batch.status);

        res.json({
            success: true,
            message: 'Recipient cancelled successfully',
        });
    } catch (error) {
        console.error('Error cancelling recipient:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel recipient',
        });
    }
});

export default router;

