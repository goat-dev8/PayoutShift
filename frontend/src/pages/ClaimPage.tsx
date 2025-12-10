import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Loader2,
    AlertCircle,
    Search,
    Wallet,
    ArrowRight,
    Gift,
    XCircle
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useCoins, Coin } from '../hooks/useCoins';
import { Button, Card, Badge } from '../components/ui';
import { validateAddress, getAddressPlaceholder } from '../utils/addressValidation';

interface ClaimData {
    name: string;
    handle?: string;
    amount: number;
    amountCurrency: string;
    status: string;
    treasuryCoin: string;
    treasuryNetwork: string;
    batchName: string;
    settleCoin?: string;
    settleNetwork?: string;
    settleAmount?: string;
    settleHash?: string;
    settledAt?: string;
}

export default function ClaimPage() {
    const { token } = useParams<{ token: string }>();
    const [step, setStep] = useState<'select' | 'address' | 'done'>('select');
    const [selectedCoin, setSelectedCoin] = useState('');
    const [selectedNetwork, setSelectedNetwork] = useState('');
    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const { data: claim, isLoading, error } = useQuery({
        queryKey: ['claim', token],
        queryFn: async () => {
            const res = await api.get(`/claims/${token}`);
            return res.data.data as ClaimData;
        },
    });

    const { data: coins } = useCoins();

    const submitClaim = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/claims/${token}`, {
                settleCoin: selectedCoin,
                settleNetwork: selectedNetwork,
                settleAddress: address,
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Claim submitted successfully!');
            setStep('done');
        },
        onError: (err: { response?: { data?: { error?: string } } }) => {
            toast.error(err.response?.data?.error || 'Failed to submit claim');
        },
    });

    // Validate address on change
    useEffect(() => {
        if (address && selectedNetwork) {
            const result = validateAddress(address, selectedNetwork);
            setAddressError(result.valid ? null : result.error || 'Invalid address');
        } else {
            setAddressError(null);
        }
    }, [address, selectedNetwork]);

    // Filter coins based on search
    const filteredCoins = useMemo(() => {
        if (!coins) return [];

        return coins.filter((coin: Coin) => {
            const searchLower = search.toLowerCase();
            return (
                coin.coin.toLowerCase().includes(searchLower) ||
                coin.name.toLowerCase().includes(searchLower) ||
                coin.networks.some(n => n.toLowerCase().includes(searchLower))
            );
        });
    }, [coins, search]);

    // Get networks for selected coin
    const availableNetworks = useMemo(() => {
        if (!selectedCoin || !coins) return [];
        const coin = coins.find((c: Coin) => c.coin === selectedCoin);
        return coin?.networks || [];
    }, [coins, selectedCoin]);

    const handleSelectCoin = (coin: string) => {
        setSelectedCoin(coin);
        const coinData = coins?.find((c: Coin) => c.coin === coin);
        if (coinData?.networks.length === 1) {
            setSelectedNetwork(coinData.networks[0]);
        } else {
            setSelectedNetwork('');
        }
        // Clear address when changing coin
        setAddress('');
        setAddressError(null);
    };

    const handleSubmit = () => {
        const result = validateAddress(address, selectedNetwork);
        if (!result.valid) {
            setAddressError(result.error || 'Invalid address');
            toast.error(result.error || 'Please enter a valid address');
            return;
        }
        submitClaim.mutate();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error || !claim) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16">
                <Card className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Claim Not Found</h2>
                    <p className="text-surface-500">
                        This claim link is invalid or has expired.
                    </p>
                </Card>
            </div>
        );
    }

    // Already settled
    if (claim.status === 'settled' && claim.settleAmount) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="p-8 text-center bg-success-500/5 border-success-500/20">
                        <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-display font-bold mb-2">You've Been Paid!</h2>
                        <p className="text-surface-600 dark:text-surface-400 mb-6">
                            Your payout has been successfully processed.
                        </p>

                        <div className="bg-white dark:bg-surface-800 rounded-xl p-6 mb-6">
                            <div className="text-sm text-surface-500 mb-1">You received</div>
                            <div className="text-3xl font-bold gradient-text">
                                {claim.settleAmount} {claim.settleCoin}
                            </div>
                            <div className="text-sm text-surface-500 mt-1">
                                on {claim.settleNetwork}
                            </div>
                        </div>

                        <div className="text-sm text-surface-500">
                            <p>Recipient: <strong>{claim.name}</strong></p>
                            <p>Batch: {claim.batchName}</p>
                            {claim.settledAt && (
                                <p>Settled: {new Date(claim.settledAt).toLocaleString()}</p>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Already claimed, waiting for funding
    if (claim.status === 'claimed' || claim.status === 'shift-created') {
        return (
            <div className="max-w-lg mx-auto px-4 py-16">
                <Card className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-warning-500/10 flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="w-8 h-8 text-warning-500 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-2">Claim Submitted!</h2>
                    <p className="text-surface-600 dark:text-surface-400 mb-6">
                        Your claim is being processed. You'll receive your payout once the batch is funded.
                    </p>

                    <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-6">
                        <div className="text-sm text-surface-500 mb-1">You requested</div>
                        <div className="text-2xl font-bold">
                            {claim.amount} {claim.amountCurrency}
                        </div>
                        <div className="text-sm text-surface-500 mt-2">
                            → {claim.settleCoin} on {claim.settleNetwork}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-display font-bold mb-2">
                    Claim Your Payout
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                    Hi <strong>{claim.name}</strong>! You have a payout of{' '}
                    <strong>{claim.amount} {claim.amountCurrency}</strong> from{' '}
                    <strong>{claim.batchName}</strong>.
                </p>
            </motion.div>

            {/* Asset Selection */}
            {step === 'select' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Choose Your Asset</h2>
                        <p className="text-surface-500 text-sm mb-4">
                            Select which cryptocurrency you'd like to receive.
                        </p>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input
                                type="text"
                                className="input pl-10"
                                placeholder="Search coins or networks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {filteredCoins.slice(0, 20).map((coin: Coin) => (
                                <button
                                    key={coin.coin}
                                    onClick={() => handleSelectCoin(coin.coin)}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${selectedCoin === coin.coin
                                        ? 'border-primary-500 bg-primary-500/5'
                                        : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                                        }`}
                                >
                                    <img
                                        src={`/api/coins/icon/${coin.coin.toLowerCase()}-${coin.networks[0]}`}
                                        alt={coin.coin}
                                        className="w-8 h-8 rounded-full"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23666"/></svg>';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{coin.coin}</div>
                                        <div className="text-xs text-surface-500">{coin.name}</div>
                                    </div>
                                    {selectedCoin === coin.coin && (
                                        <CheckCircle2 className="w-5 h-5 text-primary-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {selectedCoin && availableNetworks.length > 1 && (
                            <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                                <label className="label">Select Network</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableNetworks.map((network) => (
                                        <button
                                            key={network}
                                            onClick={() => setSelectedNetwork(network)}
                                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedNetwork === network
                                                ? 'border-primary-500 bg-primary-500/5'
                                                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                                                }`}
                                        >
                                            {network}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full mt-6"
                            onClick={() => setStep('address')}
                            disabled={!selectedCoin || !selectedNetwork}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            Continue
                        </Button>
                    </Card>
                </motion.div>
            )}

            {/* Address Input */}
            {step === 'address' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Enter Your Wallet Address</h2>

                        <div className="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <img
                                    src={`/api/coins/icon/${selectedCoin.toLowerCase()}-${selectedNetwork}`}
                                    alt={selectedCoin}
                                    className="w-10 h-10 rounded-full"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23666"/></svg>';
                                    }}
                                />
                                <div>
                                    <div className="font-semibold">{selectedCoin}</div>
                                    <div className="text-sm text-surface-500">on {selectedNetwork}</div>
                                </div>
                                <Badge variant="primary" className="ml-auto">
                                    {claim.amount} {claim.amountCurrency}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label">
                                {selectedCoin} Address on {selectedNetwork}
                            </label>
                            <div className={`relative ${addressError ? 'animate-shake' : ''}`}>
                                <input
                                    type="text"
                                    className={`input pr-10 ${addressError
                                        ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
                                        : address && !addressError
                                            ? 'border-success-500 focus:border-success-500 focus:ring-success-500/20'
                                            : ''
                                        }`}
                                    placeholder={getAddressPlaceholder(selectedNetwork)}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {address && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {addressError ? (
                                            <XCircle className="w-5 h-5 text-error-500" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {addressError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-2 text-error-500 text-sm bg-error-500/10 p-3 rounded-lg"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{addressError}</span>
                                </motion.div>
                            )}
                        </div>

                        <p className="text-sm text-surface-500 mt-4 flex items-start gap-2">
                            <Wallet className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            Make sure this is a valid {selectedNetwork} address that you control.
                        </p>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setStep('select');
                                    setAddress('');
                                    setAddressError(null);
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleSubmit}
                                isLoading={submitClaim.isPending}
                                disabled={!address || !!addressError}
                            >
                                Submit Claim
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Done */}
            {step === 'done' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="p-8 text-center">
                        <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-display font-bold mb-2">Claim Submitted!</h2>
                        <p className="text-surface-600 dark:text-surface-400">
                            Your payout will be processed once the batch is funded. You'll receive{' '}
                            <strong>{selectedCoin}</strong> on <strong>{selectedNetwork}</strong>.
                        </p>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
