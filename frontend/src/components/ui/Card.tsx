import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? { y: -2, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' } : undefined}
            className={clsx(
                'card p-6',
                hover && 'cursor-pointer transition-shadow',
                className
            )}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={clsx('mb-4', className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={clsx('text-lg font-semibold text-surface-900 dark:text-surface-100', className)}>
            {children}
        </h3>
    );
}

interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
    return (
        <p className={clsx('text-sm text-surface-500 dark:text-surface-400 mt-1', className)}>
            {children}
        </p>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={clsx(className)}>
            {children}
        </div>
    );
}
