import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
        success: 'bg-success-500/10 text-success-600 dark:text-success-500',
        warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-500',
        error: 'bg-error-500/10 text-error-600 dark:text-error-500',
        primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-500',
        secondary: 'bg-secondary-500/10 text-secondary-600 dark:text-secondary-500',
    };

    return (
        <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}

// Helper to map batch status to badge variant
export function getStatusVariant(status: string): BadgeVariant {
    switch (status) {
        case 'completed':
        case 'settled':
            return 'success';
        case 'prepared':
        case 'awaiting-funding':
        case 'shift-created':
            return 'primary';
        case 'funding-in-progress':
        case 'pending':
        case 'funded':
            return 'warning';
        case 'failed':
        case 'expired':
        case 'refunded':
            return 'error';
        case 'cancelled':
            return 'default';
        case 'partially-completed':
            return 'secondary';
        default:
            return 'default';
    }
}

