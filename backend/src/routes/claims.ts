import { Router, Request, Response } from 'express';
import { Batch, Recipient, Claim } from '../database';
import { sideshift } from '../services/sideshift';
import { getUserIp, validateAddress } from '../utils';
import { CONFIG } from '../config';

const router = Router();

// GET /api/claims/:token - Get claim details
router.get('/:token', async (req: Request, res: Response) => {
    try {
        const claim = await Claim.findOne({ claimToken: req.params.token });

        if (!claim) {
            return res.status(404).json({
                success: false,
                error: 'Claim not found or has expired',
            });
        }

        // Check expiration
        if (claim.expiresAt && claim.expiresAt < new Date()) {
            return res.status(410).json({
                success: false,
                error: 'This claim link has expired',
            });
        }

        // Get batch info
        const batch = await Batch.findById(claim.batchId).lean();

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Associated batch not found',
            });
        }

        // If already claimed and shift created, get recipient info
        let recipient = null;
        if (claim.recipientId) {
            recipient = await Recipient.findById(claim.recipientId).lean();
        }

        res.json({
            success: true,
            data: {
                name: claim.name,
                handle: claim.handle,
                amount: claim.amount,
                amountCurrency: claim.amountCurrency,
                status: claim.status,
                treasuryCoin: batch.treasuryCoin,
                treasuryNetwork: batch.treasuryNetwork,
                batchName: batch.name,
                // If claimed
                settleCoin: claim.settleCoin,
                settleNetwork: claim.settleNetwork,
                // If recipient exists with shift details
                settleAmount: recipient?.settleAmount,
                settleHash: recipient?.settleHash,
                settledAt: recipient?.settledAt,
            },
        });
    } catch (error) {
        console.error('Error fetching claim:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch claim',
        });
    }
});

// POST /api/claims/:token - Submit claim (choose asset and address)
router.post('/:token', async (req: Request, res: Response) => {
    try {
        const claim = await Claim.findOne({ claimToken: req.params.token });

        if (!claim) {
            return res.status(404).json({
                success: false,
                error: 'Claim not found',
            });
        }

        // Check if already claimed
        if (claim.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'This claim has already been submitted',
            });
        }

        // Check expiration
        if (claim.expiresAt && claim.expiresAt < new Date()) {
            return res.status(410).json({
                success: false,
                error: 'This claim link has expired',
            });
        }

        const { settleCoin, settleNetwork, settleAddress, settleMemo } = req.body;

        if (!settleCoin || !settleNetwork || !settleAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: settleCoin, settleNetwork, settleAddress',
            });
        }

        // Validate address
        const addressValidation = validateAddress(settleAddress, settleNetwork);
        if (!addressValidation.valid) {
            return res.status(400).json({
                success: false,
                error: addressValidation.error,
            });
        }

        // Check permissions (skip in development if no FORCE_USER_IP is set)
        // SideShift API rejects localhost IPs like ::1
        if (CONFIG.nodeEnv !== 'development' || CONFIG.forceUserIp) {
            const userIp = getUserIp(req);
            try {
                const permissions = await sideshift.checkPermissions(userIp);
                if (!permissions.createShift) {
                    return res.status(403).json({
                        success: false,
                        error: 'PayoutShift cannot be used from your region due to SideShift restrictions.',
                    });
                }
            } catch (permError) {
                console.warn('Permissions check failed, proceeding anyway:', permError);
                // Continue with claim - will fail at shift creation if actually blocked
            }
        }

        // Get batch
        const batch = await Batch.findById(claim.batchId);

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Associated batch not found',
            });
        }

        // Create recipient record
        const recipient = new Recipient({
            batchId: batch._id,
            name: claim.name,
            handle: claim.handle,
            amount: claim.amount,
            amountCurrency: claim.amountCurrency,
            settleCoin: settleCoin.toUpperCase(),
            settleNetwork: settleNetwork.toLowerCase(),
            settleAddress,
            settleMemo,
            status: 'validated',
        });

        await recipient.save();

        // Update claim
        claim.settleCoin = settleCoin.toUpperCase();
        claim.settleNetwork = settleNetwork.toLowerCase();
        claim.settleAddress = settleAddress;
        claim.settleMemo = settleMemo;
        claim.status = 'claimed';
        claim.claimedAt = new Date();
        claim.recipientId = recipient._id;
        await claim.save();

        // Update batch stats
        batch.totalRecipients = await Recipient.countDocuments({ batchId: batch._id });
        await batch.save();

        res.json({
            success: true,
            data: {
                message: 'Claim submitted successfully. Your payout will be processed when the batch is funded.',
                settleCoin: claim.settleCoin,
                settleNetwork: claim.settleNetwork,
            },
        });
    } catch (error) {
        console.error('Error submitting claim:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit claim',
        });
    }
});

// GET /api/claims/:token/estimate - Get payout estimate
router.get('/:token/estimate', async (req: Request, res: Response) => {
    try {
        const claim = await Claim.findOne({ claimToken: req.params.token });

        if (!claim) {
            return res.status(404).json({
                success: false,
                error: 'Claim not found',
            });
        }

        const batch = await Batch.findById(claim.batchId).lean();

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        const { settleCoin, settleNetwork } = req.query;

        if (!settleCoin || !settleNetwork) {
            return res.status(400).json({
                success: false,
                error: 'settleCoin and settleNetwork are required',
            });
        }

        // Get pair info with amount
        const from = `${batch.treasuryCoin.toLowerCase()}-${batch.treasuryNetwork}`;
        const to = `${String(settleCoin).toLowerCase()}-${String(settleNetwork).toLowerCase()}`;

        const pair = await sideshift.getPair(from, to, claim.amount);

        // Calculate estimated receive amount
        const rate = parseFloat(pair.rate);
        const estimatedReceive = claim.amount * rate;

        res.json({
            success: true,
            data: {
                depositCoin: batch.treasuryCoin,
                depositNetwork: batch.treasuryNetwork,
                depositAmount: claim.amount,
                settleCoin: String(settleCoin).toUpperCase(),
                settleNetwork: String(settleNetwork).toLowerCase(),
                estimatedReceive: estimatedReceive.toFixed(8),
                rate: pair.rate,
                min: pair.min,
                max: pair.max,
            },
        });
    } catch (error: unknown) {
        console.error('Error getting estimate:', error);

        const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
        const message = axiosError.response?.data?.error?.message || 'Failed to get estimate';

        res.status(400).json({
            success: false,
            error: message,
        });
    }
});

export default router;
