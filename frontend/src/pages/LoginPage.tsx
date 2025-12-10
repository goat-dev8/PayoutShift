import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/ui';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(password);
            toast.success('Welcome to PayoutShift Admin!');
            navigate(from, { replace: true });
        } catch {
            setError('Invalid password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-display font-bold">Admin Access</h1>
                        <p className="text-surface-600 dark:text-surface-400 mt-2">
                            Enter your admin password to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="password"
                            label="Password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error}
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-sm text-error-500 bg-error-500/10 px-4 py-3 rounded-lg"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                            leftIcon={<Lock className="w-4 h-4" />}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
                        <p className="text-sm text-surface-500 text-center">
                            Demo password: <code className="px-2 py-1 bg-surface-100 dark:bg-surface-800 rounded">payoutshift2024</code>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
