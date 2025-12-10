import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique batch ID
 */
export function generateBatchId(): string {
    return `batch_${uuidv4().split('-')[0]}`;
}

/**
 * Generate a public slug for batch proof pages
 */
export function generatePublicSlug(): string {
    return uuidv4().split('-').slice(0, 2).join('');
}

/**
 * Generate a unique claim token
 */
export function generateClaimToken(): string {
    return uuidv4().replace(/-/g, '');
}

/**
 * Format amount with proper decimals
 */
export function formatAmount(amount: number, decimals = 6): string {
    return amount.toFixed(decimals);
}

/**
 * Parse CSV content
 */
export function parseCSV(content: string): Record<string, string>[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        rows.push(row);
    }

    return rows;
}
