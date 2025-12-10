import axios, { AxiosInstance, AxiosError } from 'axios';
import Bottleneck from 'bottleneck';
import { CONFIG } from '../../config';
import {
    SideShiftCoin,
    SideShiftPair,
    SideShiftPermissions,
    SideShiftQuote,
    SideShiftShift,
    SideShiftAccount,
    SideShiftXaiStats,
    SideShiftError,
    QuoteRequest,
    FixedShiftRequest,
} from '../../types';

// Rate limiters - increased delays to prevent 429 errors
const limiterGeneral = new Bottleneck({ minTime: 500, maxConcurrent: 2 });
const limiterQuotes = new Bottleneck({ minTime: 1000, maxConcurrent: 1 });
const limiterShifts = new Bottleneck({ minTime: 1000, maxConcurrent: 1 });

// Retry helper with exponential backoff
async function retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delays = [2000, 4000, 8000, 16000]
): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            const axiosError = error as AxiosError<SideShiftError>;
            const status = axiosError.response?.status;

            // Retry on 429 (rate limited) - it's temporary
            if (status === 429) {
                if (i === retries - 1) throw error;
                const delay = delays[i] || delays[delays.length - 1];
                console.log(`[SideShift] Rate limited, retry ${i + 1}/${retries} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // Don't retry on other 4xx errors (client errors)
            if (status && status >= 400 && status < 500) {
                throw error;
            }

            if (i === retries - 1) throw error;

            const delay = delays[i] || delays[delays.length - 1];
            console.log(`[SideShift] Retry ${i + 1}/${retries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Retry failed');
}

class SideShiftClient {
    private http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: CONFIG.sideshift.apiBase,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Log requests in development
        if (CONFIG.nodeEnv === 'development') {
            this.http.interceptors.request.use((config) => {
                console.log(`[SideShift] ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            });
        }
    }

    private headers(userIp?: string, includeSecret = false): Record<string, string> {
        const h: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Determine the IP to use
        // Skip localhost IPs (::1, 127.0.0.1) as SideShift rejects them
        // In development, use FORCE_USER_IP if set, otherwise omit the header
        let effectiveIp = userIp;

        if (userIp && (userIp === '::1' || userIp.startsWith('127.') || userIp === 'localhost')) {
            // Localhost IP detected - use force IP if available
            effectiveIp = CONFIG.forceUserIp || undefined;
            if (!effectiveIp) {
                console.log('[SideShift] Skipping x-user-ip header for localhost');
            }
        }

        if (effectiveIp) {
            h['x-user-ip'] = effectiveIp;
        }

        if (includeSecret) {
            h['x-sideshift-secret'] = CONFIG.sideshift.secret;
        }

        return h;
    }

    // ============================================
    // COINS
    // ============================================

    async getCoins(): Promise<SideShiftCoin[]> {
        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.get<SideShiftCoin[]>('/coins')
            )
        );
        return res.data;
    }

    async getCoinIcon(coinNetwork: string): Promise<Buffer> {
        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.get(`/coins/icon/${coinNetwork}`, {
                    responseType: 'arraybuffer',
                })
            )
        );
        return Buffer.from(res.data);
    }

    // ============================================
    // PERMISSIONS
    // ============================================

    async checkPermissions(userIp: string): Promise<SideShiftPermissions> {
        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.get<SideShiftPermissions>('/permissions', {
                    headers: this.headers(userIp),
                })
            )
        );
        return res.data;
    }

    // ============================================
    // PAIRS
    // ============================================

    async getPair(
        from: string,
        to: string,
        amount?: number,
        commissionRate?: number
    ): Promise<SideShiftPair> {
        const params: Record<string, string | number> = {
            affiliateId: CONFIG.sideshift.affiliateId,
        };

        if (amount) params.amount = amount;
        if (commissionRate !== undefined) params.commissionRate = commissionRate;

        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.get<SideShiftPair>(`/pair/${from}/${to}`, {
                    params,
                    headers: this.headers(undefined, true),
                })
            )
        );
        return res.data;
    }

    // ============================================
    // QUOTES
    // ============================================

    async requestQuote(
        request: QuoteRequest,
        userIp?: string
    ): Promise<SideShiftQuote> {
        const body = {
            depositCoin: request.depositCoin,
            depositNetwork: request.depositNetwork,
            settleCoin: request.settleCoin,
            settleNetwork: request.settleNetwork,
            affiliateId: request.affiliateId || CONFIG.sideshift.affiliateId,
            ...(request.depositAmount ? { depositAmount: String(request.depositAmount) } : {}),
            ...(request.settleAmount ? { settleAmount: String(request.settleAmount) } : {}),
            ...(request.commissionRate ? { commissionRate: String(request.commissionRate) } : {}),
        };

        console.log('[SideShift] Requesting quote:', body);

        const res = await retry(() =>
            limiterQuotes.schedule(() =>
                this.http.post<SideShiftQuote>('/quotes', body, {
                    headers: this.headers(userIp, true),
                })
            )
        );

        console.log('[SideShift] Quote received:', res.data.id);
        return res.data;
    }

    // ============================================
    // SHIFTS
    // ============================================

    async createFixedShift(
        request: FixedShiftRequest,
        userIp?: string
    ): Promise<SideShiftShift> {
        const body = {
            quoteId: request.quoteId,
            settleAddress: request.settleAddress,
            affiliateId: request.affiliateId || CONFIG.sideshift.affiliateId,
            ...(request.settleMemo ? { settleMemo: request.settleMemo } : {}),
            ...(request.refundAddress ? { refundAddress: request.refundAddress } : {}),
            ...(request.refundMemo ? { refundMemo: request.refundMemo } : {}),
        };

        console.log('[SideShift] Creating fixed shift:', { quoteId: body.quoteId, settleAddress: body.settleAddress });

        try {
            const res = await retry(() =>
                limiterShifts.schedule(() =>
                    this.http.post<SideShiftShift>('/shifts/fixed', body, {
                        headers: this.headers(userIp, true),
                    })
                )
            );

            console.log('[SideShift] Shift created:', res.data.id);
            return res.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: unknown; status?: number } };
            if (axiosError.response) {
                console.error('[SideShift] Shift creation failed:', {
                    status: axiosError.response.status,
                    error: axiosError.response.data,
                    settleAddress: body.settleAddress,
                });
            }
            throw error;
        }
    }

    async getShift(shiftId: string): Promise<SideShiftShift> {
        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.get<SideShiftShift>(`/shifts/${shiftId}`)
            )
        );
        return res.data;
    }

    async getShiftsBulk(shiftIds: string[]): Promise<SideShiftShift[]> {
        if (shiftIds.length === 0) return [];

        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.get<SideShiftShift[]>('/shifts', {
                    params: { ids: shiftIds.join(',') },
                })
            )
        );
        return res.data;
    }

    async cancelOrder(orderId: string): Promise<void> {
        await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.post('/cancel-order', { orderId }, {
                    headers: this.headers(undefined, true),
                })
            )
        );
        console.log('[SideShift] Order cancelled:', orderId);
    }

    async setRefundAddress(
        shiftId: string,
        address: string,
        memo?: string
    ): Promise<SideShiftShift> {
        const body: Record<string, string> = { address };
        if (memo) body.memo = memo;

        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.post<SideShiftShift>(`/shifts/${shiftId}/set-refund-address`, body, {
                    headers: this.headers(undefined, true),
                })
            )
        );
        return res.data;
    }

    // ============================================
    // ACCOUNT & STATS
    // ============================================

    async getAccount(): Promise<SideShiftAccount> {
        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.get<SideShiftAccount>('/account', {
                    headers: this.headers(undefined, true),
                })
            )
        );
        return res.data;
    }

    async getXaiStats(): Promise<SideShiftXaiStats> {
        const res = await retry(() =>
            limiterGeneral.schedule(() =>
                this.http.get<SideShiftXaiStats>('/xai-stats')
            )
        );
        return res.data;
    }
}

// Export singleton instance
export const sideshift = new SideShiftClient();
