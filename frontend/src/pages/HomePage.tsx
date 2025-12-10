import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Zap,
    Shield,
    Globe,
    Users,
    CheckCircle2,
    Wallet,
    Sparkles
} from 'lucide-react';
import { Button } from '../components/ui';

export default function HomePage() {
    const features = [
        {
            icon: Zap,
            title: 'One Treasury, Many Payouts',
            description: 'Fund all recipients from a single asset. PayoutShift handles the cross-chain magic.',
        },
        {
            icon: Globe,
            title: 'Any Coin, Any Chain',
            description: 'Recipients choose their preferred token and network. 200+ assets supported via SideShift.',
        },
        {
            icon: Shield,
            title: 'Non-Custodial',
            description: 'Your funds go directly to SideShift. PayoutShift never touches your treasury.',
        },
        {
            icon: Users,
            title: 'Batch Operations',
            description: 'Pay 50+ winners in one flow. CSV upload or claim links for maximum flexibility.',
        },
    ];

    const useCases = [
        'Hackathon prize distribution',
        'DAO contributor rewards',
        'Bug bounty payouts',
        'Grant disbursements',
        'Contractor payments',
        'Airdrop execution',
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-8 border border-primary-500/20 shadow-lg shadow-primary-500/10"
                        >
                            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Sparkles className="w-4 h-4" />
                            </motion.div>
                            Powered by SideShift.ai
                            <Zap className="w-4 h-4" />
                        </motion.div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-balance mb-6">
                            Pay 50+ winners{' '}
                            <span className="gradient-text">in any coin, on any chain</span>
                            {' '}from one treasury
                        </h1>

                        <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-10 text-balance">
                            The cross-chain payout OS for hackathons, DAOs, and protocols.
                            No more manual swaps, bridges, or spreadsheet chaos.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/admin/batches/new">
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition" />
                                    <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />} className="relative shadow-xl shadow-primary-500/25">
                                        Create Payout Batch
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link to="/admin/batches">
                                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant="outline" size="lg" leftIcon={<Wallet className="w-5 h-5" />} className="shadow-lg">
                                        View My Batches
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            { value: '200+', label: 'Supported Assets' },
                            { value: '40+', label: 'Networks' },
                            { value: '0%', label: 'Platform Fee' },
                            { value: '< 2 min', label: 'Avg Settlement' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl lg:text-4xl font-display font-bold gradient-text">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-surface-500 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-surface-50 dark:bg-surface-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                            Why PayoutShift?
                        </h2>
                        <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
                            Stop wasting hours on manual swaps and individual transfers.
                            PayoutShift streamlines the entire process.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-surface-600 dark:text-surface-400 text-sm">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
                                Built for the crypto ecosystem
                            </h2>
                            <p className="text-lg text-surface-600 dark:text-surface-400 mb-8">
                                Whether you're running a hackathon, distributing grants, or paying contributors,
                                PayoutShift makes multi-recipient, cross-chain payouts a breeze.
                            </p>

                            <ul className="space-y-4">
                                {useCases.map((useCase) => (
                                    <li key={useCase} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
                                        <span className="text-surface-700 dark:text-surface-300">{useCase}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="card p-8 bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-850 dark:to-surface-900">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                                            <span className="text-primary-500 font-bold">1</span>
                                        </div>
                                        <div>
                                            <div className="font-medium">Create batch</div>
                                            <div className="text-sm text-surface-500">Upload CSV or generate claim links</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                                            <span className="text-primary-500 font-bold">2</span>
                                        </div>
                                        <div>
                                            <div className="font-medium">Recipients choose assets</div>
                                            <div className="text-sm text-surface-500">Any coin, any chain they prefer</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                                            <span className="text-primary-500 font-bold">3</span>
                                        </div>
                                        <div>
                                            <div className="font-medium">Fund the batch</div>
                                            <div className="text-sm text-surface-500">One transaction from your treasury</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-success-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-success-600 dark:text-success-400">Everyone gets paid</div>
                                            <div className="text-sm text-surface-500">Public proof page for transparency</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* SideShift API Integration Section */}
            <section className="py-20 bg-surface-50 dark:bg-surface-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
                            <Shield className="w-4 h-4" />
                            Powered by SideShift API v2
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                            Full API Integration
                        </h2>
                        <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
                            Not just a widget wrapper. PayoutShift uses 8+ SideShift API endpoints for maximum control and reliability.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { endpoint: '/v2/coins', desc: '200+ supported assets' },
                            { endpoint: '/v2/pairs', desc: 'Real-time exchange rates' },
                            { endpoint: '/v2/quotes', desc: 'Fixed-rate quotes (30min)' },
                            { endpoint: '/v2/shifts/fixed', desc: 'Order creation' },
                            { endpoint: '/v2/shifts/:id', desc: 'Status polling' },
                            { endpoint: '/v2/cancel-order', desc: 'Shift cancellation' },
                            { endpoint: '/v2/permissions', desc: 'Geo-blocking check' },
                            { endpoint: '/v2/account', desc: 'Affiliate analytics' },
                        ].map((api, index) => (
                            <motion.div
                                key={api.endpoint}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700"
                            >
                                <code className="text-xs text-primary-600 dark:text-primary-400 font-mono">
                                    {api.endpoint}
                                </code>
                                <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                                    {api.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-12 grid md:grid-cols-3 gap-6"
                    >
                        <div className="p-6 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-success-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                                </div>
                                <h4 className="font-semibold">Backend-Secured</h4>
                            </div>
                            <p className="text-sm text-surface-600 dark:text-surface-400">
                                API secrets never exposed. All SideShift calls proxied through our backend with x-user-ip headers.
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-warning-500/10 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-warning-500" />
                                </div>
                                <h4 className="font-semibold">Rate Limited</h4>
                            </div>
                            <p className="text-sm text-surface-600 dark:text-surface-400">
                                Bottleneck-based rate limiting prevents API abuse while maximizing throughput for batch operations.
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-primary-500" />
                                </div>
                                <h4 className="font-semibold">Auto-Refresh</h4>
                            </div>
                            <p className="text-sm text-surface-600 dark:text-surface-400">
                                Active batches auto-poll SideShift every 30 seconds for real-time status updates.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden bg-surface-50 dark:bg-surface-900">
                {/* Decorative Gradient Blur */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="p-12 rounded-3xl border border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl shadow-2xl">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6">
                                    <span className="gradient-text">Ready to simplify</span>
                                    <br />
                                    <span className="text-surface-900 dark:text-white">your payouts?</span>
                                </h2>
                                <p className="text-lg text-surface-600 dark:text-surface-400 mb-10 max-w-2xl mx-auto">
                                    Join hackathon organizers and DAOs who are saving hours on every payout batch.
                                </p>
                                <Link to="/admin/batches/new">
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-block"
                                    >
                                        <Button
                                            size="lg"
                                            rightIcon={<ArrowRight className="w-5 h-5" />}
                                            className="shadow-xl shadow-primary-500/25"
                                        >
                                            Get Started Free
                                        </Button>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
