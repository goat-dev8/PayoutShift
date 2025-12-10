import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    Loader2,
    AlertCircle,
    Users,
    Coins,
    Calendar,
    Share2,
    Copy,
    Twitter,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePublicBatch } from '../hooks/useBatches';
import { Card, Badge, getStatusVariant, Button } from '../components/ui';

export default function PublicBatchPage() {
    const { slug } = useParams<{ slug: string }>();
    const { data: batch, isLoading, error } = usePublicBatch(slug!);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Card className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
                    <p className="text-error-500">Batch not found</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    Public Proof Page
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    {batch.name}
                </h1>

                {batch.description && (
                    <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-6">
                        {batch.description}
                    </p>
                )}

                {/* Social Sharing Section */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="text-sm text-surface-500 flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        Share:
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const url = window.location.href;
                            const text = `Check out the ${batch.name} payouts - ${batch.totalSettled}/${batch.totalRecipients} paid! 🚀`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                        }}
                        className="flex items-center gap-2"
                    >
                        <Twitter className="w-4 h-4" />
                        Twitter
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const url = window.location.href;
                            const text = `Check out the ${batch.name} payouts - ${batch.totalSettled}/${batch.totalRecipients} paid! 🚀`;
                            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Telegram
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const url = window.location.href;
                            const text = `Check out the ${batch.name} payouts - ${batch.totalSettled}/${batch.totalRecipients} paid! 🚀`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                        }}
                        className="flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        WhatsApp
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link copied to clipboard!');
                        }}
                        className="flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        Copy Link
                    </Button>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
                <Card className="p-4 text-center">
                    <Users className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{batch.totalRecipients}</div>
                    <div className="text-sm text-surface-500">Recipients</div>
                </Card>

                <Card className="p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-success-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{batch.totalSettled}</div>
                    <div className="text-sm text-surface-500">Settled</div>
                </Card>

                <Card className="p-4 text-center">
                    <Coins className="w-6 h-6 text-secondary-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">{batch.treasuryCoin}</div>
                    <div className="text-sm text-surface-500">Treasury</div>
                </Card>

                <Card className="p-4 text-center">
                    <Calendar className="w-6 h-6 text-warning-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">
                        {new Date(batch.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-surface-500">Created</div>
                </Card>
            </motion.div>

            {/* Batch Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <Card className={`p-6 ${batch.status === 'completed' ? 'bg-success-500/5 border-success-500/20' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {batch.status === 'completed' ? (
                                <div className="w-12 h-12 rounded-full bg-success-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-success-500" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-warning-500/10 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-warning-500" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-lg font-semibold">
                                    {batch.status === 'completed' ? 'All Payouts Complete!' : 'Payouts In Progress'}
                                </h2>
                                <p className="text-surface-500">
                                    {batch.totalSettled} of {batch.totalRecipients} recipients have been paid
                                </p>
                            </div>
                        </div>
                        <Badge variant={getStatusVariant(batch.status)} className="text-sm py-1 px-3">
                            {batch.status.replace(/-/g, ' ')}
                        </Badge>
                    </div>
                </Card>
            </motion.div>

            {/* Recipients */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                        <h3 className="font-semibold">Payout Details</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-50 dark:bg-surface-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                        Recipient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                        Asset
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                                {batch.recipients?.map((recipient: {
                                    name: string;
                                    handle?: string;
                                    settleCoin: string;
                                    settleNetwork: string;
                                    settleAmount?: string;
                                    status: string;
                                }, index: number) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.05 * index }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{recipient.name}</div>
                                            {recipient.handle && (
                                                <div className="text-sm text-surface-500">{recipient.handle}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm">
                                                {recipient.settleCoin} on {recipient.settleNetwork}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {recipient.settleAmount || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusVariant(recipient.status)}>
                                                {recipient.status}
                                            </Badge>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-12 text-sm text-surface-500"
            >
                <p>
                    Payouts powered by{' '}
                    <a
                        href="https://sideshift.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600"
                    >
                        SideShift.ai
                    </a>
                    {' '}via{' '}
                    <a
                        href="/"
                        className="text-primary-500 hover:text-primary-600"
                    >
                        PayoutShift
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
