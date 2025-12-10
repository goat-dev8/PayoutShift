// Frontend address validation utilities
// Validates blockchain addresses based on network type

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

// Check if address is a valid EVM address (Ethereum, Polygon, Arbitrum, BSC, etc.)
function isValidEvmAddress(address: string): boolean {
    if (!address.startsWith('0x')) return false;
    if (address.length !== 42) return false;
    // Check if it's valid hex
    const hexPart = address.slice(2);
    return /^[0-9a-fA-F]{40}$/.test(hexPart);
}

// Check if address is a valid Solana address (Base58, 32-44 chars)
function isValidSolanaAddress(address: string): boolean {
    if (address.length < 32 || address.length > 44) return false;
    // Base58 characters only
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Check if address is a valid Bitcoin address
function isValidBitcoinAddress(address: string): boolean {
    // Legacy addresses (start with 1 or 3)
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
    // Bech32 addresses (start with bc1q or bc1p)
    if (/^bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}$/.test(address)) return true;
    return false;
}

// Check if address is a valid Litecoin address
function isValidLitecoinAddress(address: string): boolean {
    // Legacy (L or M) or SegWit (ltc1)
    if (/^[LM][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
    if (/^ltc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}$/.test(address)) return true;
    return false;
}

// Check if address is a valid TRON address
function isValidTronAddress(address: string): boolean {
    return /^T[a-zA-Z0-9]{33}$/.test(address);
}

// Check if address is a valid XRP address
function isValidXrpAddress(address: string): boolean {
    return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address);
}

// Check if address is a valid Cosmos/ATOM address
function isValidCosmosAddress(address: string, prefix: string = 'cosmos'): boolean {
    return new RegExp(`^${prefix}1[a-z0-9]{38}$`).test(address);
}

// EVM-compatible networks
const EVM_NETWORKS = [
    'ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'bsc',
    'avalanche', 'avax', 'fantom', 'cronos', 'gnosis', 'celo',
    'linea', 'scroll', 'zksync', 'mantle', 'blast'
];

// Map network to validation function
export function validateAddress(address: string, network: string): ValidationResult {
    if (!address || address.trim() === '') {
        return { valid: false, error: 'Address is required' };
    }

    const normalizedNetwork = network.toLowerCase();
    const trimmedAddress = address.trim();

    // EVM networks
    if (EVM_NETWORKS.includes(normalizedNetwork)) {
        if (!isValidEvmAddress(trimmedAddress)) {
            return {
                valid: false,
                error: `Invalid ${network} address. Must start with 0x and be 42 characters long.`
            };
        }
        return { valid: true };
    }

    // Solana
    if (normalizedNetwork === 'solana') {
        if (isValidEvmAddress(trimmedAddress)) {
            return {
                valid: false,
                error: 'This looks like an Ethereum address. Please enter a valid Solana address.'
            };
        }
        if (!isValidSolanaAddress(trimmedAddress)) {
            return {
                valid: false,
                error: 'Invalid Solana address. Must be 32-44 Base58 characters.'
            };
        }
        return { valid: true };
    }

    // Bitcoin
    if (normalizedNetwork === 'bitcoin') {
        if (isValidEvmAddress(trimmedAddress)) {
            return {
                valid: false,
                error: 'This looks like an Ethereum address. Please enter a valid Bitcoin address.'
            };
        }
        if (!isValidBitcoinAddress(trimmedAddress)) {
            return {
                valid: false,
                error: 'Invalid Bitcoin address. Must be a valid Legacy (1... or 3...) or SegWit (bc1...) address.'
            };
        }
        return { valid: true };
    }

    // Litecoin
    if (normalizedNetwork === 'litecoin') {
        if (!isValidLitecoinAddress(trimmedAddress)) {
            return {
                valid: false,
                error: 'Invalid Litecoin address. Must start with L, M, or ltc1.'
            };
        }
        return { valid: true };
    }

    // TRON
    if (normalizedNetwork === 'tron') {
        if (isValidEvmAddress(trimmedAddress)) {
            return {
                valid: false,
                error: 'This looks like an Ethereum address. Please enter a valid TRON address starting with T.'
            };
        }
        if (!isValidTronAddress(trimmedAddress)) {
            return {
                valid: false,
                error: 'Invalid TRON address. Must start with T and be 34 characters.'
            };
        }
        return { valid: true };
    }

    // XRP/Ripple
    if (normalizedNetwork === 'ripple' || normalizedNetwork === 'xrp') {
        if (!isValidXrpAddress(trimmedAddress)) {
            return {
                valid: false,
                error: 'Invalid XRP address. Must start with r.'
            };
        }
        return { valid: true };
    }

    // Cosmos/ATOM
    if (normalizedNetwork === 'cosmos' || normalizedNetwork === 'atom') {
        if (!isValidCosmosAddress(trimmedAddress, 'cosmos')) {
            return {
                valid: false,
                error: 'Invalid Cosmos address. Must start with cosmos1.'
            };
        }
        return { valid: true };
    }

    // TON
    if (normalizedNetwork === 'ton') {
        // TON addresses are typically 48 characters base64
        if (trimmedAddress.length < 40) {
            return {
                valid: false,
                error: 'Invalid TON address. Address appears too short.'
            };
        }
        return { valid: true };
    }

    // Default - basic length check only
    if (trimmedAddress.length < 20) {
        return {
            valid: false,
            error: 'Address appears to be too short.'
        };
    }

    return { valid: true };
}

// Get address placeholder text based on network
export function getAddressPlaceholder(network: string): string {
    const normalizedNetwork = network.toLowerCase();

    if (EVM_NETWORKS.includes(normalizedNetwork)) {
        return '0x...';
    }
    if (normalizedNetwork === 'solana') {
        return 'Solana address (Base58)';
    }
    if (normalizedNetwork === 'bitcoin') {
        return 'bc1... or 1... or 3...';
    }
    if (normalizedNetwork === 'tron') {
        return 'T...';
    }
    if (normalizedNetwork === 'ripple' || normalizedNetwork === 'xrp') {
        return 'r...';
    }

    return 'Enter your wallet address';
}
