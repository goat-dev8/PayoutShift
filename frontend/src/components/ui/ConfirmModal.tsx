import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'bg-error-500/10 text-error-500',
            button: 'bg-error-500 hover:bg-error-600 text-white',
        },
        warning: {
            icon: 'bg-warning-500/10 text-warning-500',
            button: 'bg-warning-500 hover:bg-warning-600 text-white',
        },
        info: {
            icon: 'bg-primary-500/10 text-primary-500',
            button: 'bg-primary-500 hover:bg-primary-600 text-white',
        },
    };

    const styles = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.icon}`}>
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold">{title}</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <p className="text-surface-600 dark:text-surface-400">{message}</p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 bg-surface-50 dark:bg-surface-900/50">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    {cancelText}
                                </Button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${styles.button}`}
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
