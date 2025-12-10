import { Router, Request, Response } from 'express';
import { sideshift } from '../services/sideshift';
import { getUserIp } from '../utils';
import { LRUCache } from 'lru-cache';

const router = Router();

// Cache for coins (24 hours)
const coinsCache = new LRUCache<string, object>({
    max: 1,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
});

// Cache for icons (24 hours)
const iconCache = new LRUCache<string, { data: Buffer; contentType: string }>({
    max: 500,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
});

// GET /api/coins - Get all supported coins
router.get('/', async (_req: Request, res: Response) => {
    try {
        // Check cache
        const cached = coinsCache.get('coins');
        if (cached) {
            return res.json({ success: true, data: cached });
        }

        const coins = await sideshift.getCoins();
        coinsCache.set('coins', coins);

        res.json({ success: true, data: coins });
    } catch (error) {
        console.error('Error fetching coins:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch coins',
        });
    }
});

// GET /api/coins/icon/:coinNetwork - Get coin icon
router.get('/icon/:coinNetwork', async (req: Request, res: Response) => {
    try {
        const { coinNetwork } = req.params;

        // Check cache
        const cached = iconCache.get(coinNetwork);
        if (cached) {
            res.set('Content-Type', cached.contentType);
            res.set('Cache-Control', 'public, max-age=86400');
            return res.send(cached.data);
        }

        const iconData = await sideshift.getCoinIcon(coinNetwork);

        // Determine content type (SVG or PNG)
        const isSvg = iconData.toString('utf8', 0, 5).includes('<svg') ||
            iconData.toString('utf8', 0, 5).includes('<?xml');
        const contentType = isSvg ? 'image/svg+xml' : 'image/png';

        iconCache.set(coinNetwork, { data: iconData, contentType });

        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(iconData);
    } catch (error) {
        console.error('Error fetching icon:', error);
        res.status(404).json({
            success: false,
            error: 'Icon not found',
        });
    }
});

// GET /api/coins/permissions - Check if user can create shifts
router.get('/permissions', async (req: Request, res: Response) => {
    try {
        const userIp = getUserIp(req);
        const permissions = await sideshift.checkPermissions(userIp);

        res.json({
            success: true,
            data: permissions,
        });
    } catch (error) {
        console.error('Error checking permissions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check permissions',
        });
    }
});

// GET /api/coins/pair/:from/:to - Get pair info
router.get('/pair/:from/:to', async (req: Request, res: Response) => {
    try {
        const { from, to } = req.params;
        const amount = req.query.amount ? parseFloat(req.query.amount as string) : undefined;

        const pair = await sideshift.getPair(from, to, amount);

        res.json({
            success: true,
            data: pair,
        });
    } catch (error: unknown) {
        console.error('Error fetching pair:', error);

        const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
        const message = axiosError.response?.data?.error?.message || 'Failed to fetch pair info';

        res.status(400).json({
            success: false,
            error: message,
        });
    }
});

export default router;
