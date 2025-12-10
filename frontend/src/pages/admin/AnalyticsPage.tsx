import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    BarChart3,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    Package,
    Sparkles,
    ArrowUpRight,
    Zap,
    Download,
    Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent, Badge, getStatusVariant, Button } from '../../components/ui';
import { LiveActivityFeed } from '../../components/LiveActivityFeed';
import { PopularRates } from '../../components/ExchangeRateDisplay';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

// Animated number component
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
            {value}{suffix}
        </motion.span>
    );
}

export default function AnalyticsPage() {
    // Local stats from our database
    const { data: localStats, isLoading: localLoading, error: localError } = useQuery({
        queryKey: ['analytics', 'local'],
        queryFn: async () => {
            const res = await api.get('/analytics/local');
            return res.data.data;
        },
    });

    // SideShift account stats (may be empty if no completed shifts)
    const { data: account } = useQuery({
        queryKey: ['analytics', 'account'],
        queryFn: async () => {
            const res = await api.get('/analytics/account');
            return res.data.data;
        },
    });

    if (localLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500"
                />
                <p className="text-surface-500 animate-pulse">Loading your analytics...</p>
            </div>
        );
    }

    if (localError) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="p-8 text-center border-error-500/20 bg-error-50/50 dark:bg-error-900/10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-error-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-2">Failed to Load</h3>
                        <p className="text-surface-600 dark:text-surface-400">Please try again.</p>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statCards = [
        {
            label: 'Total Batches',
            value: localStats?.batches?.total || 0,
            icon: Package,
            color: 'from-primary-500 to-secondary-500',
            bgColor: 'bg-primary-500/10',
            textColor: 'text-primary-500',
        },
        {
            label: 'Completed',
            value: localStats?.batches?.completed || 0,
            icon: CheckCircle2,
            color: 'from-success-500 to-emerald-500',
            bgColor: 'bg-success-500/10',
            textColor: 'text-success-500',
        },
        {
            label: 'Active',
            value: localStats?.batches?.active || 0,
            icon: Clock,
            color: 'from-warning-500 to-orange-500',
            bgColor: 'bg-warning-500/10',
            textColor: 'text-warning-500',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25"
                    >
                        <BarChart3 className="w-5 h-5 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-display font-bold">
                        <span className="gradient-text">Analytics</span>
                    </h1>
                </div>
                <p className="text-surface-600 dark:text-surface-400">
                    Track your PayoutShift performance and activity
                </p>
            </motion.div>

            {/* Batch Stats */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                {statCards.map((stat) => (
                    <motion.div key={stat.label} variants={itemVariants}>
                        <Card className="p-6 group relative overflow-hidden">
                            {/* Hover gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                        className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-lg`}
                                    >
                                        <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                                    </motion.div>
                                    <div>
                                        <div className="text-sm text-surface-500 font-medium">{stat.label}</div>
                                        <div className="text-3xl font-bold">
                                            <AnimatedNumber value={stat.value} />
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-surface-300 group-hover:text-primary-500 transition-colors" />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recipient Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
            >
                <Card className="p-6 relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-500/5 to-transparent" />

                    <CardHeader className="pb-6 relative">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500/20 to-primary-500/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-secondary-500" />
                            </div>
                            <span>Recipient Statistics</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                            {[
                                { label: 'Total', value: localStats?.recipients?.total || 0, color: 'text-surface-800 dark:text-surface-200' },
                                { label: 'Settled', value: localStats?.recipients?.settled || 0, color: 'text-success-500' },
                                { label: 'Pending', value: localStats?.recipients?.pending || 0, color: 'text-warning-500' },
                                { label: 'Cancelled', value: localStats?.recipients?.cancelled || 0, color: 'text-surface-400' },
                                { label: 'Expired', value: localStats?.recipients?.expired || 0, color: 'text-orange-500' },
                                { label: 'Failed', value: localStats?.recipients?.failed || 0, color: 'text-error-500' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    className="text-center p-4 rounded-2xl bg-surface-50/50 dark:bg-surface-800/30"
                                >
                                    <div className={`text-3xl font-bold ${stat.color}`}>
                                        <AnimatedNumber value={stat.value} />
                                    </div>
                                    <div className="text-sm text-surface-500 mt-1 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Status Breakdown Chart */}
            {localStats?.statusBreakdown && Object.keys(localStats.statusBreakdown).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <Card className="p-6">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-primary-500" />
                                </div>
                                <span>Status Breakdown</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(localStats.statusBreakdown).map(([status, count], i) => {
                                    const total = localStats.recipients.total || 1;
                                    const percentage = Math.round(((count as number) / total) * 100);
                                    const colors: Record<string, { bar: string; text: string }> = {
                                        settled: { bar: 'from-success-500 to-emerald-500', text: 'text-success-500' },
                                        pending: { bar: 'from-warning-500 to-orange-400', text: 'text-warning-500' },
                                        'shift-created': { bar: 'from-primary-500 to-primary-400', text: 'text-primary-500' },
                                        funded: { bar: 'from-secondary-500 to-secondary-400', text: 'text-secondary-500' },
                                        cancelled: { bar: 'from-surface-400 to-surface-300', text: 'text-surface-400' },
                                        expired: { bar: 'from-orange-500 to-orange-400', text: 'text-orange-500' },
                                        failed: { bar: 'from-error-500 to-error-400', text: 'text-error-500' },
                                    };
                                    const color = colors[status] || { bar: 'from-surface-400 to-surface-300', text: 'text-surface-400' };

                                    return (
                                        <motion.div
                                            key={status}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.05 }}
                                        >
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className={`capitalize font-medium ${color.text}`}>
                                                    {status.replace('-', ' ')}
                                                </span>
                                                <span className="text-surface-500">
                                                    {count as number} <span className="text-xs">({percentage}%)</span>
                                                </span>
                                            </div>
                                            <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.8, delay: 0.6 + i * 0.05, ease: "easeOut" }}
                                                    className={`h-full bg-gradient-to-r ${color.bar} rounded-full shadow-sm`}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Recent Batches */}
            {localStats?.recentBatches && localStats.recentBatches.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                >
                    <Card className="overflow-hidden">
                        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-primary-500" />
                                </div>
                                <h3 className="font-semibold">Recent Batches</h3>
                            </div>
                            <Link to="/admin/batches" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                                View all →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-surface-50 dark:bg-surface-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Recipients</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Settled</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                                    {localStats.recentBatches.map((batch: { _id: string; name: string; status: string; totalRecipients: number; totalSettled: number; createdAt: string }, i: number) => (
                                        <motion.tr
                                            key={batch._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 + i * 0.05 }}
                                            className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium">{batch.name}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusVariant(batch.status)}>{batch.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4">{batch.totalRecipients}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-success-500 font-medium">{batch.totalSettled}</span>
                                            </td>
                                            <td className="px-6 py-4 text-surface-500">{formatDate(batch.createdAt)}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* SideShift Account Stats (if available) */}
            {account?.volume && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="p-6 relative overflow-hidden">
                        {/* Gradient decoration */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-success-500/5 to-transparent" />

                        <CardHeader className="pb-6 relative">
                            <CardTitle className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success-500/20 to-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-success-500" />
                                </div>
                                <span>SideShift Account</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Volume', value: `$${account.volume.total || 0}` },
                                    { label: 'Last 24h', value: `$${account.volume.last24h || 0}` },
                                    { label: 'Last 7 days', value: `$${account.volume.last7d || 0}` },
                                    { label: 'Commissions', value: `$${account.commission?.total || 0}` },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 + i * 0.05 }}
                                        className="p-4 rounded-2xl bg-success-50/50 dark:bg-success-900/10"
                                    >
                                        <div className="text-sm text-surface-500 mb-1">{stat.label}</div>
                                        <div className="text-xl font-bold text-success-600 dark:text-success-400">{stat.value}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Live Activity Feed & Exchange Rates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Live Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card className="p-6 h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-primary-500" />
                                </div>
                                <span>Live Activity</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LiveActivityFeed />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Exchange Rates */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Card className="p-6 h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success-500/20 to-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-success-500" />
                                </div>
                                <span>Live Exchange Rates</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PopularRates />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* CSV Export Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mb-8"
            >
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-500/20 to-primary-500/20 flex items-center justify-center">
                                <Download className="w-6 h-6 text-secondary-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Export History</h3>
                                <p className="text-sm text-surface-500">Download your complete payout history as CSV</p>
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                leftIcon={<Download className="w-4 h-4" />}
                                onClick={() => {
                                    window.open(`${api.defaults.baseURL}/analytics/export-csv`, '_blank');
                                }}
                            >
                                Export CSV
                            </Button>
                        </motion.div>
                    </div>
                </Card>
            </motion.div>

            {/* Empty state when no data */}
            {localStats?.batches?.total === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8"
                >
                    <Card className="p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
                        <div className="relative">
                            <motion.div
                                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center shadow-xl"
                            >
                                <Zap className="w-10 h-10 text-primary-500" />
                            </motion.div>
                            <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
                            <p className="text-surface-500 mb-6">Create your first batch to see analytics here.</p>
                            <Link to="/admin/batches/new">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold shadow-lg shadow-primary-500/25"
                                >
                                    Create Your First Batch
                                </motion.button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

