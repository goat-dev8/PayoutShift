import { motion } from 'framer-motion';
import { ArrowRightLeft, Clock, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface RecentShift {
    _id: string;
    name: string;
    settleCoin: string;
    settleNetwork: string;
    amount: number;
    status: string;
    settledAt?: string;
    createdAt: string;
}

export function LiveActivityFeed() {
    const { data: recentShifts, isLoading } = useQuery({
        queryKey: ['recentActivity'],
        queryFn: async () => {
            const res = await api.get('/analytics/recent-activity');
            return res.data.data as RecentShift[];
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!recentShifts || recentShifts.length === 0) {
        return (
            <div className="text-center py-8 text-surface-500">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {recentShifts.slice(0, 5).map((shift, index) => (
                <motion.div
                    key={shift._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                            <ArrowRightLeft className="w-5 h-5 text-primary-500" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">
                                {shift.name}
                            </p>
                            <p className="text-xs text-surface-500">
                                {shift.amount} → {shift.settleCoin.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${shift.status === 'settled'
                            ? 'bg-success-500/10 text-success-500'
                            : 'bg-warning-500/10 text-warning-500'
                            }`}>
                            {shift.status}
                        </span>
                        <p className="text-xs text-surface-400 mt-1 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(shift.settledAt || shift.createdAt)}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
