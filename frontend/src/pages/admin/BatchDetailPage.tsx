import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    RefreshCw,
    Play,
    Download,
    ExternalLink,
    Copy,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Users,
    Coins,
    Timer,
    XCircle,
    QrCode
} from 'lucide-react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import { useBatch, usePrepareBatch, useRefreshStatus, useFundingInstructions, useCancelRecipient, Recipient } from '../../hooks/useBatches';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, getStatusVariant, ConfirmModal } from '../../components/ui';

// Format time remaining
function formatTimeRemaining(expiresAt: string): string {
    const now = new Date();
    const expires = new Date(expiresAt);
    const remaining = expires.getTime() - now.getTime();

    if (remaining <= 0) return 'Expired';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
}

// Truncate address for display
function truncateAddress(address: string): string {
    if (!address || address.length < 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

// Statuses that require auto-refresh (active batches)
const ACTIVE_STATUSES = ['prepared', 'awaiting-funding', 'funding-in-progress'];

export default function BatchDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: batch, isLoading, error, refetch: refetchBatch } = useBatch(id!);
    const prepareBatch = usePrepareBatch();
    const refreshStatus = useRefreshStatus();
    const cancelRecipient = useCancelRecipient();
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; recipient: Recipient | null }>({
        isOpen: false,
        recipient: null,
    });
    const [expandedQR, setExpandedQR] = useState<string | null>(null); // Track which deposit address QR is expanded
    const { data: fundingData } = useFundingInstructions(
        batch?.status === 'prepared' || batch?.status === 'awaiting-funding' || batch?.status === 'funding-in-progress' ? id! : ''
    );
    const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-refresh status for active batches
    useEffect(() => {
        if (!batch || !id) return;

        // Only auto-refresh for active batches
        if (ACTIVE_STATUSES.includes(batch.status)) {
            // Initial refresh on page load
            refreshStatus.mutate(id, {
                onSuccess: () => refetchBatch(),
            });

            // Set up polling every 30 seconds
            autoRefreshIntervalRef.current = setInterval(() => {
                refreshStatus.mutate(id, {
                    onSuccess: () => refetchBatch(),
                });
            }, 30000);
        }

        return () => {
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
            }
        };
    }, [batch?.status, id]);

    // Check if recipient can be cancelled
    // Must be 5+ minutes old and in a cancellable status (not expired/settled/cancelled)
    const isCancellable = (recipient: Recipient) => {
        const cancellableStatuses = ['shift-created', 'waiting'];
        if (!cancellableStatuses.includes(recipient.status)) return false;

        // Check if shift is at least 5 minutes old (required by SideShift)
        // We use expiresAt: shifts expire in 15 min, so if <10 min left, it's >5 min old
        if (recipient.expiresAt) {
            const expiresAt = new Date(recipient.expiresAt);
            const now = new Date();
            const remainingMs = expiresAt.getTime() - now.getTime();
            const remainingMinutes = remainingMs / 60000;

            // If expired, can't cancel
            if (remainingMinutes <= 0) return false;

            // If more than 10 minutes remaining, shift is less than 5 min old - can't cancel yet
            if (remainingMinutes > 10) return false;
        }

        return true;
    };

    // Check if we should show "Wait X min" message
    const getWaitMessage = (recipient: Recipient) => {
        if (recipient.expiresAt) {
            const expiresAt = new Date(recipient.expiresAt);
            const now = new Date();
            const remainingMs = expiresAt.getTime() - now.getTime();
            const remainingMinutes = remainingMs / 60000;

            if (remainingMinutes > 10) {
                const waitMinutes = Math.ceil(remainingMinutes - 10);
                return `Wait ${waitMinutes}m`;
            }
        }
        return null;
    };

    const openCancelModal = (recipient: Recipient) => {
        setCancelModal({ isOpen: true, recipient });
    };

    const closeCancelModal = () => {
        setCancelModal({ isOpen: false, recipient: null });
    };

    const handleCancelRecipient = async () => {
        if (!cancelModal.recipient) return;

        setCancellingId(cancelModal.recipient._id);
        try {
            await cancelRecipient.mutateAsync({ batchId: id!, recipientId: cancelModal.recipient._id });
            toast.success('Recipient cancelled successfully');
            closeCancelModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const errorMsg = err.response?.data?.error || 'Failed to cancel recipient';
            toast.error(errorMsg);
        } finally {
            setCancellingId(null);
        }
    };

    const handlePrepare = async () => {
        try {
            const result = await prepareBatch.mutateAsync(id!);
            toast.success(`Prepared ${result.prepared} shifts!`);
            if (result.failed > 0) {
                toast.error(`${result.failed} shifts failed`);
            }
        } catch {
            toast.error('Failed to prepare batch');
        }
    };

    const handleRefresh = async () => {
        try {
            const result = await refreshStatus.mutateAsync(id!);
            toast.success(`Updated ${result.updated} shifts`);
        } catch {
            toast.error('Failed to refresh status');
        }
    };

    const copyToClipboard = (text: string, message = 'Copied to clipboard!') => {
        navigator.clipboard.writeText(text);
        toast.success(message);
    };

    const downloadFundingCSV = () => {
        if (!fundingData?.recipients) return;

        const csv = ['Address,Amount,Memo,Recipient,ShiftId,ExpiresAt'].concat(
            fundingData.recipients.map((r: { depositAddress: string; depositAmount: string; depositMemo: string; name: string; shiftId?: string; expiresAt?: string }) =>
                `${r.depositAddress},${r.depositAmount},${r.depositMemo || ''},${r.name},${r.shiftId || ''},${r.expiresAt || ''}`
            )
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${batch?.name || 'batch'}-funding.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500"
                />
                <p className="text-surface-500 animate-pulse">Loading batch details...</p>
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="p-8 text-center border-error-500/20 bg-error-50/50 dark:bg-error-900/10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-error-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-2">Batch Not Found</h3>
                        <p className="text-surface-600 dark:text-surface-400 mb-6">The batch you're looking for doesn't exist or you don't have access to it.</p>
                        <Link to="/admin/batches">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                    Back to Batches
                                </Button>
                            </motion.div>
                        </Link>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/admin/batches"
                    className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to batches
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-display font-bold">{batch.name}</h1>
                            <Badge variant={getStatusVariant(batch.status)}>
                                {batch.status.replace(/-/g, ' ')}
                            </Badge>
                        </div>
                        <p className="text-surface-600 dark:text-surface-400 mt-1">
                            {batch.description || `Paying ${batch.totalRecipients} recipients in ${batch.treasuryCoin}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {batch.status === 'draft' && batch.totalRecipients > 0 && (
                            <Button
                                onClick={handlePrepare}
                                isLoading={prepareBatch.isPending}
                                leftIcon={<Play className="w-4 h-4" />}
                            >
                                Prepare Shifts
                            </Button>
                        )}

                        {(batch.status === 'prepared' || batch.status === 'funding-in-progress') && (
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                isLoading={refreshStatus.isPending}
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                            >
                                Refresh Status
                            </Button>
                        )}

                        <Link to={`/batches/${batch.publicSlug}`} target="_blank">
                            <Button variant="ghost" leftIcon={<ExternalLink className="w-4 h-4" />}>
                                Public Page
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{batch.totalRecipients}</div>
                            <div className="text-sm text-surface-500">Recipients</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary-500/10 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-secondary-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{batch.totalAmount}</div>
                            <div className="text-sm text-surface-500">{batch.treasuryCoin}</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{batch.totalSettled}</div>
                            <div className="text-sm text-surface-500">Settled</div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-warning-500" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {batch.totalRecipients - batch.totalSettled}
                            </div>
                            <div className="text-sm text-surface-500">Pending</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Funding Instructions */}
            {fundingData && (batch.status === 'prepared' || batch.status === 'funding-in-progress') && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Card className="p-6 border-primary-500/20 bg-primary-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-primary-500" />
                                Funding Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">
                                Send <strong>{fundingData.totalAmount} {fundingData.treasuryCoin}</strong> on{' '}
                                <strong>{fundingData.treasuryNetwork}</strong> network to the deposit addresses below.
                            </p>

                            <div className="flex gap-3 mb-6">
                                <Button
                                    variant="outline"
                                    onClick={downloadFundingCSV}
                                    leftIcon={<Download className="w-4 h-4" />}
                                >
                                    Download CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => copyToClipboard(JSON.stringify(fundingData.safeTransactions, null, 2), 'Safe JSON copied!')}
                                    leftIcon={<Copy className="w-4 h-4" />}
                                >
                                    Copy Safe JSON
                                </Button>
                            </div>

                            {/* Detailed Deposit List */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-sm text-surface-700 dark:text-surface-300">
                                    Deposit Addresses ({fundingData.recipientCount} shifts)
                                </h4>

                                <div className="space-y-3">
                                    {fundingData.recipients?.map((r: { name: string; depositAddress: string; depositAmount: string; depositMemo?: string; settleCoin: string; settleNetwork: string; settleAmount: string; expiresAt?: string }, idx: number) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold">{r.name}</span>
                                                        <Badge variant="default" className="text-xs">
                                                            {r.settleCoin} on {r.settleNetwork}
                                                        </Badge>
                                                    </div>

                                                    {/* Deposit Address with QR Code Button */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm text-surface-500">Deposit Address:</span>
                                                        <code className="text-sm font-mono bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded">
                                                            {truncateAddress(r.depositAddress)}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(r.depositAddress, 'Address copied!')}
                                                            className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded"
                                                            title="Copy address"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => setExpandedQR(expandedQR === r.depositAddress ? null : r.depositAddress)}
                                                            className={`p-1 rounded transition-colors ${expandedQR === r.depositAddress
                                                                ? 'bg-primary-500/20 text-primary-500'
                                                                : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                                                                }`}
                                                            title="Show QR Code"
                                                        >
                                                            <QrCode className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {/* QR Code - Expanded */}
                                                    {expandedQR === r.depositAddress && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="mb-3 p-3 bg-white rounded-lg border border-surface-200 dark:border-surface-600 inline-block"
                                                        >
                                                            <QRCode
                                                                value={r.depositAddress}
                                                                size={120}
                                                                level="M"
                                                            />
                                                            <p className="text-xs text-center mt-2 text-surface-500">
                                                                Scan to copy address
                                                            </p>
                                                        </motion.div>
                                                    )}

                                                    {/* Deposit Memo if applicable */}
                                                    {r.depositMemo && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-sm text-surface-500">Memo:</span>
                                                            <code className="text-sm font-mono bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded">
                                                                {r.depositMemo}
                                                            </code>
                                                            <button
                                                                onClick={() => copyToClipboard(r.depositMemo!, 'Memo copied!')}
                                                                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Amount */}
                                                    <div className="text-sm">
                                                        <span className="text-surface-500">Send:</span>{' '}
                                                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                            {r.depositAmount} {fundingData.treasuryCoin}
                                                        </span>
                                                        <span className="text-surface-400 mx-2">→</span>
                                                        <span className="text-success-600 dark:text-success-400">
                                                            Receive: {r.settleAmount} {r.settleCoin}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Expiration */}
                                                {r.expiresAt && (
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-warning-500">
                                                            <Timer className="w-4 h-4" />
                                                            <span className="text-sm font-medium">
                                                                {formatTimeRemaining(r.expiresAt)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-surface-500 mt-1">
                                                            until expiry
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Recipients Table */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                    <h3 className="font-semibold">Recipients</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-50 dark:bg-surface-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                    Recipient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                    Settle Asset
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                    Shift ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                    TX
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                            {batch.recipients?.map((recipient) => (
                                <tr key={recipient._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{recipient.name}</div>
                                        {recipient.handle && (
                                            <div className="text-sm text-surface-500">{recipient.handle}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{recipient.amount} {batch.treasuryCoin}</div>
                                        {recipient.settleAmount && (
                                            <div className="text-sm text-surface-500">
                                                → {recipient.settleAmount} {recipient.settleCoin}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm">
                                            {recipient.settleCoin} on {recipient.settleNetwork}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {recipient.shiftId ? (
                                            <button
                                                onClick={() => copyToClipboard(recipient.shiftId!, 'Shift ID copied!')}
                                                className="flex items-center gap-1 text-sm font-mono text-primary-500 hover:text-primary-600"
                                            >
                                                {recipient.shiftId.slice(0, 10)}...
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        ) : (
                                            <span className="text-surface-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusVariant(recipient.status)}>
                                            {recipient.status}
                                        </Badge>
                                        {recipient.error && (
                                            <div className="text-xs text-error-500 mt-1 max-w-[200px] truncate" title={recipient.error}>
                                                {recipient.error}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {recipient.settleHash ? (
                                            <a
                                                href={`https://etherscan.io/tx/${recipient.settleHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View TX
                                            </a>
                                        ) : (
                                            <span className="text-surface-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isCancellable(recipient) ? (
                                            <button
                                                onClick={() => openCancelModal(recipient)}
                                                disabled={cancellingId === recipient._id}
                                                className="flex items-center gap-1 text-sm text-error-500 hover:text-error-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {cancellingId === recipient._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="w-4 h-4" />
                                                )}
                                                Cancel
                                            </button>
                                        ) : getWaitMessage(recipient) ? (
                                            <span className="text-sm text-warning-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {getWaitMessage(recipient)}
                                            </span>
                                        ) : recipient.status === 'cancelled' ? (
                                            <span className="text-sm text-surface-400">Cancelled</span>
                                        ) : recipient.status === 'expired' ? (
                                            <span className="text-sm text-surface-400">Expired</span>
                                        ) : ['settled', 'funded'].includes(recipient.status) ? (
                                            <span className="text-sm text-success-500">Completed</span>
                                        ) : (
                                            <span className="text-surface-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {(!batch.recipients || batch.recipients.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-surface-500">
                                        No recipients yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Claim Links (if applicable) */}
            {batch.mode === 'claim-links' && batch.claims && batch.claims.length > 0 && (
                <Card className="mt-8 overflow-hidden">
                    <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                        <h3 className="font-semibold">Claim Links</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-50 dark:bg-surface-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">
                                        Recipient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase">
                                        Claim Link
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                                {batch.claims.map((claim) => (
                                    <tr key={claim._id}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{claim.name}</div>
                                            {claim.handle && (
                                                <div className="text-sm text-surface-500">{claim.handle}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {claim.amount} {batch.treasuryCoin}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusVariant(claim.status)}>
                                                {claim.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => copyToClipboard(`${window.location.origin}/claim/${claim.claimToken}`)}
                                                className="flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm"
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy Link
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={cancelModal.isOpen}
                onClose={closeCancelModal}
                onConfirm={handleCancelRecipient}
                title="Cancel Order"
                message={`Are you sure you want to cancel the order for "${cancelModal.recipient?.name}"? This action cannot be undone.`}
                confirmText="Cancel Order"
                cancelText="Keep Order"
                variant="danger"
                isLoading={cancelRecipient.isPending}
            />
        </div>
    );
}
