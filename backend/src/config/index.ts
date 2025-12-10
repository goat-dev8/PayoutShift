import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root. Try multiple paths.
// When running via npm from root: cwd is project root
// When running from backend dir: need to go up one level
const envPaths = [
    path.resolve(process.cwd(), '.env'),           // From root via npm script
    path.resolve(process.cwd(), '../.env'),         // From backend directory
    path.resolve(__dirname, '../../../.env'),       // Relative to config file
];

let envLoaded = false;
for (const envPath of envPaths) {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
        console.log(`✅ Loaded .env from: ${envPath}`);
        envLoaded = true;
        break;
    }
}

if (!envLoaded) {
    console.warn('⚠️ Could not load .env file, using process environment');
}

export const CONFIG = {
    // Server
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL || '',

    // SideShift
    sideshift: {
        apiBase: process.env.SIDESHIFT_API_BASE || 'https://sideshift.ai/api/v2',
        secret: process.env.SIDESHIFT_SECRET || '',
        affiliateId: process.env.SIDESHIFT_AFFILIATE_ID || '',
    },

    // App
    appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    commissionRate: parseFloat(process.env.COMMISSION_RATE || '0.005'),

    // Auth
    adminPassword: process.env.ADMIN_PASSWORD || 'changeme',
    jwtSecret: process.env.JWT_SECRET || process.env.SIDESHIFT_SECRET || 'default-jwt-secret',

    // IP handling
    forceUserIp: process.env.FORCE_USER_IP || '',

    // Rate limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500', 10),
};

export function validateConfig(): void {
    const required = [
        'DATABASE_URL',
        'SIDESHIFT_SECRET',
        'SIDESHIFT_AFFILIATE_ID',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing environment variables:', missing);
        console.error('Create a .env file in the project root with these variables.');
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    console.log('✅ Configuration validated');
}
