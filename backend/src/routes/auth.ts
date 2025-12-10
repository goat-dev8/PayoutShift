import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';

const router = Router();

// POST /api/auth/login - Admin login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required',
            });
        }

        if (password !== CONFIG.adminPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid password',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { role: 'admin' },
            CONFIG.jwtSecret,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: { token },
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed',
        });
    }
});

// GET /api/auth/verify - Verify token
router.get('/verify', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            jwt.verify(token, CONFIG.jwtSecret);
            res.json({ success: true, data: { valid: true } });
        } catch {
            res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
        }
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({
            success: false,
            error: 'Verification failed',
        });
    }
});

export default router;
