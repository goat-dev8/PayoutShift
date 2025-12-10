/**
 * Address validation utilities for different blockchain networks
 * Based on patterns from example.md
 */

// EVM address validation (Ethereum, Base, Polygon, etc.)
export function isValidEvmAddress(address: string): boolean {
    if (!address) return false;
    // Basic format check: 0x followed by 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Solana address validation
export function isValidSolanaAddress(address: string): boolean {
    if (!address) return false;
    // Base58 encoded, 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Bitcoin address validation (Legacy, P2SH, SegWit - NOT Taproot)
export function isValidBitcoinAddress(address: string): boolean {
    if (!address) return false;

    // Reject Taproot addresses (bc1p...) - not supported by SideShift
    if (/^bc1p[a-z0-9]{58}$/i.test(address)) {
        return false;
    }

    // Legacy (1...)
    if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;

    // P2SH (3...)
    if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;

    // SegWit (bc1q...)
    if (/^bc1q[a-z0-9]{38,58}$/i.test(address)) return true;

    return false;
}

// Litecoin address validation
export function isValidLitecoinAddress(address: string): boolean {
    if (!address) return false;
    // L or M prefix (Legacy), ltc1 (SegWit)
    return /^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address) ||
        /^ltc1[a-z0-9]{39,59}$/i.test(address);
}

// Bitcoin Cash address validation
export function isValidBitcoinCashAddress(address: string): boolean {
    if (!address) return false;
    // CashAddr format
    return /^(bitcoincash:)?[qp][a-z0-9]{41}$/i.test(address);
}

// Cosmos-based chains (ATOM, etc.)
export function isValidCosmosAddress(address: string, prefix = 'cosmos'): boolean {
    if (!address) return false;
    return new RegExp(`^${prefix}1[a-z0-9]{38}$`).test(address);
}

// TRON address validation
export function isValidTronAddress(address: string): boolean {
    if (!address) return false;
    return /^T[a-zA-Z0-9]{33}$/.test(address);
}

// XRP address validation
export function isValidXrpAddress(address: string): boolean {
    if (!address) return false;
    return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address);
}

// Generic validation by network
export function validateAddress(address: string, network: string): {
    valid: boolean;
    error?: string;
} {
    if (!address || address.trim() === '') {
        return { valid: false, error: 'Address is required' };
    }

    const networkLower = network.toLowerCase();

    // EVM networks
    const evmNetworks = [
        'ethereum', 'mainnet', 'base', 'arbitrum', 'optimism',
        'polygon', 'bsc', 'avax', 'fantom', 'gnosis'
    ];
    if (evmNetworks.includes(networkLower)) {
        if (!isValidEvmAddress(address)) {
            return { valid: false, error: 'Invalid EVM address. Must start with 0x followed by 40 hex characters.' };
        }
        return { valid: true };
    }

    // Solana
    if (networkLower === 'solana') {
        if (!isValidSolanaAddress(address)) {
            return { valid: false, error: 'Invalid Solana address.' };
        }
        return { valid: true };
    }

    // Bitcoin
    if (networkLower === 'bitcoin') {
        if (/^bc1p/i.test(address)) {
            return { valid: false, error: 'Taproot (bc1p) addresses are not supported. Use bc1q, 1, or 3 addresses.' };
        }
        if (!isValidBitcoinAddress(address)) {
            return { valid: false, error: 'Invalid Bitcoin address. Use addresses starting with 1, 3, or bc1q.' };
        }
        return { valid: true };
    }

    // Litecoin
    if (networkLower === 'litecoin') {
        if (!isValidLitecoinAddress(address)) {
            return { valid: false, error: 'Invalid Litecoin address.' };
        }
        return { valid: true };
    }

    // Bitcoin Cash
    if (networkLower === 'bitcoincash') {
        if (!isValidBitcoinCashAddress(address)) {
            return { valid: false, error: 'Invalid Bitcoin Cash address.' };
        }
        return { valid: true };
    }

    // TRON
    if (networkLower === 'tron') {
        if (!isValidTronAddress(address)) {
            return { valid: false, error: 'Invalid TRON address. Must start with T.' };
        }
        return { valid: true };
    }

    // XRP
    if (networkLower === 'ripple' || networkLower === 'xrp') {
        if (!isValidXrpAddress(address)) {
            return { valid: false, error: 'Invalid XRP address. Must start with r.' };
        }
        return { valid: true };
    }

    // For other networks, do basic non-empty check
    if (address.length < 10) {
        return { valid: false, error: 'Address appears too short.' };
    }

    return { valid: true };
}
