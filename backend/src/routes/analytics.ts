import { Router, Request, Response, NextFunction } from 'express';
import { sideshift } from '../services/sideshift';
import { Batch, Recipient } from '../database';

const router = Router();

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

// GET /api/analytics/account - Get SideShift account stats
router.get('/account', requireAuth, async (_req: AuthRequest, res: Response) => {
    try {
        const account = await sideshift.getAccount();

        res.json({
            success: true,
            data: account,
        });
    } catch (error: unknown) {
        console.error('Error fetching account:', error);

        const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
        const message = axiosError.response?.data?.error?.message || 'Failed to fetch account info';

        res.status(500).json({
            success: false,
            error: message,
        });
    }
});

// GET /api/analytics/xai - Get XAI stats
router.get('/xai', requireAuth, async (_req: AuthRequest, res: Response) => {
    try {
        const xaiStats = await sideshift.getXaiStats();

        res.json({
            success: true,
            data: xaiStats,
        });
    } catch (error: unknown) {
        console.error('Error fetching XAI stats:', error);

        const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
        const message = axiosError.response?.data?.error?.message || 'Failed to fetch XAI stats';

        res.status(500).json({
            success: false,
            error: message,
        });
    }
});

// GET /api/analytics/local - Get local batch statistics for the connected wallet
router.get('/local', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const ownerAddress = req.walletAddress;

        // Get all batches owned by this wallet
        const ownedBatches = await Batch.find({ ownerAddress }).select('_id').lean();
        const batchIds = ownedBatches.map(b => b._id);

        // Get batch counts for this user
        const totalBatches = ownedBatches.length;
        const completedBatches = await Batch.countDocuments({ ownerAddress, status: 'completed' });
        const activeBatches = await Batch.countDocuments({
            ownerAddress,
            status: { $in: ['draft', 'prepared', 'awaiting-funding', 'funding-in-progress'] }
        });

        // Get recipient stats for this user's batches only
        const totalRecipients = await Recipient.countDocuments({ batchId: { $in: batchIds } });
        const settledRecipients = await Recipient.countDocuments({
            batchId: { $in: batchIds },
            status: 'settled'
        });
        const pendingRecipients = await Recipient.countDocuments({
            batchId: { $in: batchIds },
            status: { $in: ['pending', 'shift-created', 'waiting', 'funded'] }
        });
        const cancelledRecipients = await Recipient.countDocuments({
            batchId: { $in: batchIds },
            status: 'cancelled'
        });
        const expiredRecipients = await Recipient.countDocuments({
            batchId: { $in: batchIds },
            status: 'expired'
        });
        const failedRecipients = await Recipient.countDocuments({
            batchId: { $in: batchIds },
            status: 'failed'
        });

        // Calculate total volume for this user's batches
        const volumeResult = await Recipient.aggregate([
            { $match: { batchId: { $in: batchIds }, status: 'settled' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalVolume = volumeResult[0]?.total || 0;

        // Get recent activity for this user
        const recentBatches = await Batch.find({ ownerAddress })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name status totalRecipients totalSettled createdAt')
            .lean();

        // Get status breakdown for this user's recipients
        const statusBreakdown = await Recipient.aggregate([
            { $match: { batchId: { $in: batchIds } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                batches: {
                    total: totalBatches,
                    completed: completedBatches,
                    active: activeBatches,
                },
                recipients: {
                    total: totalRecipients,
                    settled: settledRecipients,
                    pending: pendingRecipients,
                    cancelled: cancelledRecipients,
                    expired: expiredRecipients,
                    failed: failedRecipients,
                },
                volume: {
                    settled: totalVolume,
                },
                statusBreakdown: statusBreakdown.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {} as Record<string, number>),
                recentBatches,
            },
        });
    } catch (error) {
        console.error('Error fetching local stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch local statistics',
        });
    }
});

// GET /api/analytics/recent-activity - Get recent settled shifts for live feed
router.get('/recent-activity', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const walletAddress = req.walletAddress!;

        // Get batches owned by this wallet
        const batches = await Batch.find({ ownerAddress: walletAddress }).select('_id');
        const batchIds = batches.map(b => b._id);

        // Get recent settled recipients from user's batches
        const recentRecipients = await Recipient.find({
            batchId: { $in: batchIds },
            status: { $in: ['settled', 'funded'] },
        })
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();

        const activity = recentRecipients.map(r => ({
            _id: r._id,
            name: r.name,
            settleCoin: r.settleCoin,
            settleNetwork: r.settleNetwork,
            amount: r.settleAmount,
            status: r.status,
            settledAt: r.updatedAt,
            createdAt: r.createdAt,
        }));

        res.json({
            success: true,
            data: activity,
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent activity',
        });
    }
});

// GET /api/analytics/export-csv - Export batch history as CSV
router.get('/export-csv', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const walletAddress = req.walletAddress!;

        // Get all batches for this wallet
        const batches = await Batch.find({ ownerAddress: walletAddress })
            .sort({ createdAt: -1 })
            .lean();

        const batchIds = batches.map(b => b._id);

        // Get all recipients for these batches
        const recipients = await Recipient.find({ batchId: { $in: batchIds } }).lean();

        // Create CSV content
        const csvHeader = 'Batch Name,Recipient Name,Settle Coin,Settle Network,Amount,Status,Address,Created At,Updated At';
        const csvRows = recipients.map(r => {
            const batch = batches.find(b => String(b._id) === String(r.batchId));
            return [
                batch?.name || '',
                r.name,
                r.settleCoin,
                r.settleNetwork,
                r.settleAmount,
                r.status,
                r.settleAddress,
                r.createdAt,
                r.updatedAt,
            ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',');
        });

        const csv = [csvHeader, ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=payoutshift-history.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export CSV',
        });
    }
});

export default router;



