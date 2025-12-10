import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { CONFIG, validateConfig } from './config';
import { connectDatabase } from './database';
import {
    authRoutes,
    coinsRoutes,
    batchesRoutes,
    claimsRoutes,
    analyticsRoutes,
} from './routes';

// Validate config before starting
validateConfig();

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
    origin: CONFIG.corsOrigin,
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (CONFIG.nodeEnv !== 'test') {
    app.use(morgan('dev'));
}

// Trust proxy for IP extraction (set to specific proxy count or false for local dev)
// In production, set this to the number of proxies (e.g., 1 for a single reverse proxy)
if (CONFIG.nodeEnv === 'production') {
    app.set('trust proxy', 1);
}

// Rate limiting - disabled for buildathon to prevent judge errors
// Set a very high limit - this still protects against abuse but won't block normal usage
const limiter = rateLimit({
    windowMs: CONFIG.rateLimitWindowMs,
    max: 10000, // Very high limit to prevent any blocking
    message: { success: false, error: 'Too many requests, please try again later.' },
    validate: { trustProxy: false }, // Disable trust proxy validation
});
app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            env: CONFIG.nodeEnv,
        },
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/coins', coinsRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
    });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: CONFIG.nodeEnv === 'development' ? err.message : 'Internal server error',
    });
});

// Start server
async function start() {
    try {
        // Connect to database
        await connectDatabase();

        // Start listening
        app.listen(CONFIG.port, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⚡ PayoutShift Backend                                  ║
║                                                           ║
║   Server:    http://localhost:${CONFIG.port}                     ║
║   Mode:      ${CONFIG.nodeEnv.padEnd(12)}                         ║
║   Database:  Connected ✅                                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
