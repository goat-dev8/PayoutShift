import { Request } from 'express';
import { CONFIG } from '../config';

/**
 * Extract user IP from request for SideShift API
 * Respects proxy headers and allows override for testing
 */
export function getUserIp(req: Request): string {
    // Allow force override for local testing
    if (CONFIG.forceUserIp) {
        return CONFIG.forceUserIp;
    }

    // Check common proxy headers
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
        return ips.split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to request IP
    return req.ip || req.socket.remoteAddress || '127.0.0.1';
}
