import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Folder, Calendar, Users, Coins, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useBatches, Batch } from '../../hooks/useBatches';
import { Button, Card, Badge, getStatusVariant } from '../../components/ui';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
};

export default function BatchListPage() {
    const { data: batches, isLoading, error } = useBatches();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500"
                />
                <p className="text-surface-500 animate-pulse">Loading your batches...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="p-8 text-center border-error-500/20 bg-error-50/50 dark:bg-error-900/10">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-error-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-2">Failed to Load</h3>
                        <p className="text-surface-600 dark:text-surface-400">Please check your connection and try again.</p>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
            >
                <div>
                    <h1 className="text-3xl font-display font-bold">
                        <span className="gradient-text">Payout</span> Batches
                    </h1>
                    <p className="text-surface-600 dark:text-surface-400 mt-1">
                        Manage your cross-chain payout batches
                    </p>
                </div>
                <Link to="/admin/batches/new">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            leftIcon={<Plus className="w-4 h-4" />}
                            className="shadow-lg shadow-primary-500/25"
                        >
                            New Batch
                        </Button>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Batch list */}
            {batches && batches.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {batches.map((batch: Batch) => (
                        <motion.div
                            key={batch._id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, x: 4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <Link to={`/admin/batches/${batch.batchId}`}>
                                <Card hover className="p-6 group relative overflow-hidden">
                                    {/* Hover gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-secondary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                whileHover={{ rotate: 10, scale: 1.1 }}
                                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center shadow-lg"
                                            >
                                                <Folder className="w-7 h-7 text-primary-500" />
                                            </motion.div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-lg group-hover:text-primary-500 transition-colors">{batch.name}</h3>
                                                    <ArrowRight className="w-4 h-4 text-surface-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <p className="text-sm text-surface-500 mt-0.5 line-clamp-1">
                                                    {batch.description || 'No description'}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                                    <span className="flex items-center gap-1.5 text-sm text-surface-500">
                                                        <Users className="w-4 h-4" />
                                                        <span className="font-medium text-surface-700 dark:text-surface-300">{batch.totalRecipients}</span> recipients
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-sm text-surface-500">
                                                        <Coins className="w-4 h-4" />
                                                        <span className="font-medium text-surface-700 dark:text-surface-300">{batch.totalAmount}</span> {batch.treasuryCoin}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-sm text-surface-500">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(batch.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={getStatusVariant(batch.status)} className="shrink-0">
                                            {batch.status.replace(/-/g, ' ')}
                                        </Badge>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="p-12 text-center relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />

                        <div className="relative">
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center shadow-xl"
                            >
                                <Sparkles className="w-10 h-10 text-primary-500" />
                            </motion.div>
                            <h3 className="text-xl font-semibold mb-2">Welcome to PayoutShift!</h3>
                            <p className="text-surface-500 mb-8 max-w-md mx-auto">
                                Create your first payout batch to start paying recipients across any chain, in any token they want.
                            </p>
                            <Link to="/admin/batches/new">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        size="lg"
                                        leftIcon={<Plus className="w-5 h-5" />}
                                        rightIcon={<ArrowRight className="w-5 h-5" />}
                                        className="shadow-lg shadow-primary-500/25"
                                    >
                                        Create Your First Batch
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

