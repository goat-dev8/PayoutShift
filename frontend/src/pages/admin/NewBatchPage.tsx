import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Upload,
    Link as LinkIcon,
    Check,
    Loader2,
    Download,
    FileText,
    Plus,
    Trash2,
    X,
    Users,
    Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCoins, Coin } from '../../hooks/useCoins';
import { useCreateBatch, useUploadRecipients, useCreateClaims } from '../../hooks/useBatches';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui';
import CoinSelector from '../../components/ui/CoinSelector';
import { validateAddress, getAddressPlaceholder } from '../../utils/addressValidation';

type Step = 1 | 2 | 3;
type Mode = 'csv-upload' | 'claim-links';
type InputMode = 'file' | 'manual' | 'paste';

interface Recipient {
    id: string;
    name: string;
    handle: string;
    amount: string;
    settleCoin: string;
    settleNetwork: string;
    settleAddress: string;
}

interface FormData {
    name: string;
    description: string;
    treasuryCoin: string;
    treasuryNetwork: string;
    treasuryRefundAddress: string;
    mode: Mode;
    fixedAmount: string;
    fixedAmountCurrency: string;
    csvContent: string;
    inputMode: InputMode;
    recipients: Recipient[];
    claimRecipients: { name: string; handle: string; amount: string }[];
}

const SAMPLE_CSV = `name,handle,amount,amountCurrency,settleCoin,settleNetwork,settleAddress
John Doe,@john,100,USD,ETH,ethereum,0xYourAddressHere
Jane Smith,@jane,150,USD,SOL,solana,YourSolanaAddressHere
Bob Wilson,@bob,75,USD,BTC,bitcoin,YourBitcoinAddressHere`;

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function NewBatchPage() {
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        treasuryCoin: 'USDC',
        treasuryNetwork: 'base',
        treasuryRefundAddress: '',
        mode: 'csv-upload',
        fixedAmount: '',
        fixedAmountCurrency: 'USD',
        csvContent: '',
        inputMode: 'manual',
        recipients: [{ id: generateId(), name: '', handle: '', amount: '', settleCoin: '', settleNetwork: '', settleAddress: '' }],
        claimRecipients: [{ name: '', handle: '', amount: '' }],
    });
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();
    const { data: coins } = useCoins();
    const createBatch = useCreateBatch();
    const uploadRecipients = useUploadRecipients();
    const createClaims = useCreateClaims();

    const updateField = (field: keyof FormData, value: string | Mode | InputMode) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Recipient management for CSV mode
    const addRecipient = () => {
        setFormData(prev => ({
            ...prev,
            recipients: [...prev.recipients, {
                id: generateId(),
                name: '',
                handle: '',
                amount: '',
                settleCoin: '',
                settleNetwork: '',
                settleAddress: ''
            }],
        }));
    };

    const removeRecipient = (id: string) => {
        setFormData(prev => ({
            ...prev,
            recipients: prev.recipients.filter(r => r.id !== id),
        }));
    };

    const updateRecipient = (id: string, field: keyof Recipient, value: string) => {
        setFormData(prev => ({
            ...prev,
            recipients: prev.recipients.map(r =>
                r.id === id ? { ...r, [field]: value } : r
            ),
        }));
    };

    const addMultipleRecipients = (count: number) => {
        const newRecipients = Array(count).fill(null).map(() => ({
            id: generateId(),
            name: '',
            handle: '',
            amount: '',
            settleCoin: '',
            settleNetwork: '',
            settleAddress: ''
        }));
        setFormData(prev => ({
            ...prev,
            recipients: [...prev.recipients, ...newRecipients],
        }));
        toast.success(`Added ${count} recipients`);
    };

    // Convert recipients array to CSV
    const recipientsToCSV = (): string => {
        const header = 'name,handle,amount,amountCurrency,settleCoin,settleNetwork,settleAddress';
        const rows = formData.recipients
            .filter(r => r.name && r.amount && r.settleAddress)
            .map(r => `${r.name},${r.handle || ''},${r.amount},USD,${r.settleCoin},${r.settleNetwork},${r.settleAddress}`);
        return [header, ...rows].join('\n');
    };

    // Claim recipients management
    const addClaimRecipient = () => {
        setFormData(prev => ({
            ...prev,
            claimRecipients: [...prev.claimRecipients, { name: '', handle: '', amount: '' }],
        }));
    };

    const removeClaimRecipient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            claimRecipients: prev.claimRecipients.filter((_, i) => i !== index),
        }));
    };

    const updateClaimRecipient = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            claimRecipients: prev.claimRecipients.map((r, i) =>
                i === index ? { ...r, [field]: value } : r
            ),
        }));
    };

    // File handling
    const handleFileSelect = useCallback((file: File) => {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setFormData(prev => ({ ...prev, csvContent: content }));
            setFileName(file.name);
            toast.success('CSV file loaded!');
        };
        reader.readAsText(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const downloadTemplate = () => {
        const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payoutshift-template.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Template downloaded!');
    };

    const clearFile = () => {
        setFormData(prev => ({ ...prev, csvContent: '' }));
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        try {
            // Create batch
            const batch = await createBatch.mutateAsync({
                name: formData.name,
                description: formData.description || undefined,
                treasuryCoin: formData.treasuryCoin,
                treasuryNetwork: formData.treasuryNetwork,
                treasuryRefundAddress: formData.treasuryRefundAddress || undefined,
                mode: formData.mode,
                fixedAmount: formData.fixedAmount ? parseFloat(formData.fixedAmount) : undefined,
                fixedAmountCurrency: formData.fixedAmountCurrency || undefined,
            });

            // Add recipients
            if (formData.mode === 'csv-upload') {
                let csvContent = formData.csvContent;

                // If manual mode, convert recipients to CSV
                if (formData.inputMode === 'manual') {
                    csvContent = recipientsToCSV();
                }

                if (csvContent) {
                    await uploadRecipients.mutateAsync({
                        batchId: batch.batchId,
                        csvContent: csvContent,
                    });
                    toast.success('Batch created with recipients!');
                }
            } else if (formData.mode === 'claim-links' && formData.claimRecipients.length > 0) {
                const validRecipients = formData.claimRecipients
                    .filter(r => r.name && r.amount)
                    .map(r => ({
                        name: r.name,
                        handle: r.handle || undefined,
                        amount: parseFloat(r.amount),
                        amountCurrency: formData.fixedAmountCurrency,
                    }));

                if (validRecipients.length > 0) {
                    const claimUrls = await createClaims.mutateAsync({
                        batchId: batch.batchId,
                        recipients: validRecipients,
                    });
                    toast.success(`Created ${claimUrls.length} claim links!`);
                }
            } else {
                toast.success('Batch created!');
            }

            navigate(`/admin/batches/${batch.batchId}`);
        } catch (error) {
            console.error('Error creating batch:', error);
            toast.error('Failed to create batch. Please try again.');
        }
    };

    const canProceed = () => {
        if (step === 1) {
            return formData.name && formData.treasuryCoin && formData.treasuryNetwork;
        }
        if (step === 2) {
            return true;
        }
        return true;
    };

    const isSubmitting = createBatch.isPending || uploadRecipients.isPending || createClaims.isPending;

    // Validate recipient with address check
    const getRecipientValidation = (r: Recipient) => {
        if (!r.name || !r.amount || !r.settleAddress || !r.settleCoin || !r.settleNetwork) {
            return { valid: false, error: 'Missing required fields' };
        }
        return validateAddress(r.settleAddress, r.settleNetwork);
    };

    const validRecipientsCount = formData.recipients.filter(r => getRecipientValidation(r).valid).length;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <button
                    onClick={() => navigate('/admin/batches')}
                    className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to batches
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold">Create New Batch</h1>
                        <p className="text-surface-600 dark:text-surface-400">
                            Set up a new cross-chain payout batch
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Progress */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 mb-8"
            >
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all shadow-lg ${s < step
                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                : s === step
                                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white ring-4 ring-primary-500/30'
                                    : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
                                }`}
                        >
                            {s < step ? <Check className="w-6 h-6" /> : s}
                        </motion.div>
                        {s < 3 && (
                            <div className={`w-20 h-1.5 rounded-full transition-all ${s < step
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500'
                                : 'bg-surface-200 dark:bg-surface-700'
                                }`} />
                        )}
                    </div>
                ))}
            </motion.div>

            {/* Steps */}
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        <Card className="p-6 border-2 border-surface-200/50 dark:border-surface-700/50 hover:border-primary-500/30 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 text-sm font-bold">1</span>
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Name your batch and select your treasury asset
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <Input
                                    label="Batch Name"
                                    placeholder="e.g., SideShift Wave 3 Prizes"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                />
                                <Input
                                    label="Description (optional)"
                                    placeholder="Brief description of this payout batch"
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                />

                                <div>
                                    <label className="label">Treasury Asset</label>
                                    <p className="text-sm text-surface-500 mb-3">
                                        Select the coin and network you'll use to fund this batch
                                    </p>
                                    {coins && (
                                        <CoinSelector
                                            coins={coins}
                                            selectedCoin={formData.treasuryCoin}
                                            selectedNetwork={formData.treasuryNetwork}
                                            onSelectCoin={(coin) => {
                                                updateField('treasuryCoin', coin);
                                                const coinData = coins.find((c: Coin) => c.coin === coin);
                                                if (coinData?.networks.length === 1) {
                                                    updateField('treasuryNetwork', coinData.networks[0]);
                                                }
                                            }}
                                            onSelectNetwork={(network) => updateField('treasuryNetwork', network)}
                                            placeholder="Select treasury asset"
                                        />
                                    )}
                                </div>

                                <Input
                                    label="Refund Address (optional)"
                                    placeholder="Your treasury wallet address for refunds"
                                    value={formData.treasuryRefundAddress}
                                    onChange={(e) => updateField('treasuryRefundAddress', e.target.value)}
                                    hint="If a shift fails, funds will be refunded to this address"
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        <Card className="p-6 border-2 border-surface-200/50 dark:border-surface-700/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 text-sm font-bold">2</span>
                                    Recipient Collection Mode
                                </CardTitle>
                                <CardDescription>
                                    Choose how recipients will be added to this batch
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.01, y: -2 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => updateField('mode', 'csv-upload')}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.mode === 'csv-upload'
                                            ? 'border-primary-500 bg-gradient-to-br from-primary-500/10 to-secondary-500/5 shadow-lg shadow-primary-500/10'
                                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${formData.mode === 'csv-upload'
                                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                                : 'bg-primary-500/10'
                                                }`}>
                                                <Upload className={`w-7 h-7 ${formData.mode === 'csv-upload' ? 'text-white' : 'text-primary-500'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">CSV Upload / Manual Entry</h3>
                                                <p className="text-sm text-surface-500">
                                                    Upload a CSV or manually enter recipient details with their wallet addresses and preferred assets
                                                </p>
                                            </div>
                                            {formData.mode === 'csv-upload' && (
                                                <Check className="w-6 h-6 text-primary-500" />
                                            )}
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.01, y: -2 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => updateField('mode', 'claim-links')}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.mode === 'claim-links'
                                            ? 'border-secondary-500 bg-gradient-to-br from-secondary-500/10 to-primary-500/5 shadow-lg shadow-secondary-500/10'
                                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${formData.mode === 'claim-links'
                                                ? 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-white'
                                                : 'bg-secondary-500/10'
                                                }`}>
                                                <LinkIcon className={`w-7 h-7 ${formData.mode === 'claim-links' ? 'text-white' : 'text-secondary-500'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">Claim Links</h3>
                                                <p className="text-sm text-surface-500">
                                                    Generate unique claim links for each recipient to choose their own asset and wallet address
                                                </p>
                                            </div>
                                            {formData.mode === 'claim-links' && (
                                                <Check className="w-6 h-6 text-secondary-500" />
                                            )}
                                        </div>
                                    </motion.button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && formData.mode === 'csv-upload' && (
                    <motion.div
                        key="step3-csv"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        <Card className="p-6 border-2 border-surface-200/50 dark:border-surface-700/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 text-sm font-bold">3</span>
                                    Add Recipients
                                </CardTitle>
                                <CardDescription>
                                    Add recipients with their wallet addresses and preferred assets
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Input Mode Tabs */}
                                <div className="flex gap-1 mb-6 p-1.5 bg-surface-100 dark:bg-surface-800 rounded-xl">
                                    {[
                                        { id: 'manual', label: 'Manual Entry', icon: Users },
                                        { id: 'file', label: 'Upload CSV', icon: Upload },
                                        { id: 'paste', label: 'Paste CSV', icon: FileText },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => updateField('inputMode', tab.id as InputMode)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.inputMode === tab.id
                                                ? 'bg-white dark:bg-surface-700 shadow-md text-primary-600 dark:text-primary-400'
                                                : 'hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400'
                                                }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Manual Entry Mode */}
                                {formData.inputMode === 'manual' && coins && (
                                    <div className="space-y-4">
                                        {/* Quick Add */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 border border-primary-500/20 rounded-xl"
                                        >
                                            <Sparkles className="w-5 h-5 text-primary-500" />
                                            <span className="text-sm font-medium">Quick Add:</span>
                                            {[3, 5, 10].map(num => (
                                                <Button
                                                    key={num}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addMultipleRecipients(num)}
                                                    className="hover:bg-primary-500 hover:text-white hover:border-primary-500"
                                                >
                                                    +{num}
                                                </Button>
                                            ))}
                                        </motion.div>

                                        {/* Recipients List */}
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                            <AnimatePresence>
                                                {formData.recipients.map((recipient, index) => (
                                                    <motion.div
                                                        key={recipient.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -100 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        className="p-5 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-500/30 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <span className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-primary-500/10 flex items-center justify-center text-xs font-bold text-primary-500">
                                                                    {index + 1}
                                                                </span>
                                                                <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
                                                                    Recipient
                                                                </span>
                                                            </span>
                                                            {formData.recipients.length > 1 && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => removeRecipient(recipient.id)}
                                                                    className="p-2 text-error-500 hover:bg-error-500/10 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </motion.button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                            <input
                                                                className="input"
                                                                placeholder="Name *"
                                                                value={recipient.name}
                                                                onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                                                            />
                                                            <input
                                                                className="input"
                                                                placeholder="@handle (optional)"
                                                                value={recipient.handle}
                                                                onChange={(e) => updateRecipient(recipient.id, 'handle', e.target.value)}
                                                            />
                                                            <input
                                                                className="input"
                                                                type="number"
                                                                placeholder="Amount (USD) *"
                                                                value={recipient.amount}
                                                                onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="mb-4">
                                                            <label className="text-xs font-medium text-surface-500 mb-2 block">Asset to receive</label>
                                                            <CoinSelector
                                                                coins={coins}
                                                                selectedCoin={recipient.settleCoin}
                                                                selectedNetwork={recipient.settleNetwork}
                                                                onSelectCoin={(coin) => {
                                                                    updateRecipient(recipient.id, 'settleCoin', coin);
                                                                    const coinData = coins.find((c: Coin) => c.coin === coin);
                                                                    if (coinData?.networks.length === 1) {
                                                                        updateRecipient(recipient.id, 'settleNetwork', coinData.networks[0]);
                                                                    }
                                                                }}
                                                                onSelectNetwork={(network) => updateRecipient(recipient.id, 'settleNetwork', network)}
                                                                placeholder="Select asset to receive"
                                                            />
                                                        </div>

                                                        {/* Address input with validation */}
                                                        {(() => {
                                                            const validation = recipient.settleAddress && recipient.settleNetwork
                                                                ? validateAddress(recipient.settleAddress, recipient.settleNetwork)
                                                                : { valid: false, error: undefined };
                                                            const hasError = recipient.settleAddress && recipient.settleNetwork && !validation.valid;
                                                            const isValid = recipient.settleAddress && recipient.settleNetwork && validation.valid;

                                                            return (
                                                                <div>
                                                                    <div className="relative">
                                                                        <input
                                                                            className={`input pr-10 ${hasError
                                                                                ? 'border-error-500 focus:ring-error-500'
                                                                                : isValid
                                                                                    ? 'border-success-500 focus:ring-success-500'
                                                                                    : ''
                                                                                }`}
                                                                            placeholder={recipient.settleNetwork ? getAddressPlaceholder(recipient.settleNetwork) : 'Wallet Address *'}
                                                                            value={recipient.settleAddress}
                                                                            onChange={(e) => updateRecipient(recipient.id, 'settleAddress', e.target.value)}
                                                                        />
                                                                        {isValid && (
                                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                                <Check className="w-5 h-5 text-success-500" />
                                                                            </div>
                                                                        )}
                                                                        {hasError && (
                                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                                <X className="w-5 h-5 text-error-500" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {hasError && validation.error && (
                                                                        <motion.p
                                                                            initial={{ opacity: 0, y: -5 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            className="mt-2 text-sm text-error-500 flex items-start gap-1"
                                                                        >
                                                                            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                            {validation.error}
                                                                        </motion.p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
                                            <Button
                                                variant="outline"
                                                onClick={addRecipient}
                                                leftIcon={<Plus className="w-4 h-4" />}
                                            >
                                                Add Recipient
                                            </Button>

                                            {validRecipientsCount > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-success-500/10 text-success-600 dark:text-success-400 rounded-full"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        {validRecipientsCount} valid recipient{validRecipientsCount !== 1 ? 's' : ''}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* File Upload Mode */}
                                {formData.inputMode === 'file' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={downloadTemplate}
                                            leftIcon={<Download className="w-4 h-4" />}
                                        >
                                            Download Template
                                        </Button>

                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging
                                                ? 'border-primary-500 bg-primary-500/5 scale-[1.01]'
                                                : fileName
                                                    ? 'border-success-500 bg-success-500/5'
                                                    : 'border-surface-300 dark:border-surface-600 hover:border-primary-500'
                                                }`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileInputChange}
                                                className="hidden"
                                            />

                                            {fileName ? (
                                                <motion.div
                                                    initial={{ scale: 0.9 }}
                                                    animate={{ scale: 1 }}
                                                    className="flex items-center justify-center gap-4"
                                                >
                                                    <div className="w-14 h-14 rounded-xl bg-success-500/10 flex items-center justify-center">
                                                        <FileText className="w-7 h-7 text-success-500" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-semibold">{fileName}</p>
                                                        <p className="text-sm text-success-500">File loaded successfully</p>
                                                    </div>
                                                    <button
                                                        onClick={clearFile}
                                                        className="p-2 text-surface-500 hover:text-error-500 hover:bg-error-500/10 rounded-full transition-colors"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-4">
                                                        <Upload className="w-8 h-8 text-surface-400" />
                                                    </div>
                                                    <p className="text-lg font-semibold mb-2">
                                                        Drag & drop your CSV file here
                                                    </p>
                                                    <p className="text-surface-500 mb-4">or</p>
                                                    <Button onClick={() => fileInputRef.current?.click()}>
                                                        Browse Files
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Paste CSV Mode */}
                                {formData.inputMode === 'paste' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={downloadTemplate}
                                            leftIcon={<Download className="w-4 h-4" />}
                                        >
                                            Download Template
                                        </Button>

                                        <div>
                                            <label className="label">CSV Content</label>
                                            <textarea
                                                className="input h-72 font-mono text-sm"
                                                placeholder={`name,handle,amount,amountCurrency,settleCoin,settleNetwork,settleAddress
John,@john,100,USD,ETH,ethereum,0x...
Jane,@jane,150,USD,SOL,solana,...`}
                                                value={formData.csvContent}
                                                onChange={(e) => updateField('csvContent', e.target.value)}
                                            />
                                            <p className="text-sm text-surface-500 mt-2">
                                                Required columns: name, amount, settleCoin, settleNetwork, settleAddress
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && formData.mode === 'claim-links' && (
                    <motion.div
                        key="step3-claims"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        <Card className="p-6 border-2 border-surface-200/50 dark:border-surface-700/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-secondary-500/10 flex items-center justify-center text-secondary-500 text-sm font-bold">3</span>
                                    Add Claim Link Recipients
                                </CardTitle>
                                <CardDescription>
                                    Add recipients who will receive unique claim links to choose their preferred asset
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <Input
                                            label="Fixed Amount (optional)"
                                            type="number"
                                            placeholder="e.g., 100"
                                            value={formData.fixedAmount}
                                            onChange={(e) => updateField('fixedAmount', e.target.value)}
                                        />
                                        <div>
                                            <label className="label">Currency</label>
                                            <select
                                                className="input"
                                                value={formData.fixedAmountCurrency}
                                                onChange={(e) => updateField('fixedAmountCurrency', e.target.value)}
                                            >
                                                <option value="USD">USD</option>
                                                <option value={formData.treasuryCoin}>{formData.treasuryCoin}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                                        <label className="label mb-3">Recipients</label>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                            <AnimatePresence>
                                                {formData.claimRecipients.map((recipient, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -100 }}
                                                        className="flex gap-3 items-center p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl"
                                                    >
                                                        <span className="w-7 h-7 rounded-full bg-secondary-500/10 flex items-center justify-center text-xs font-bold text-secondary-500">
                                                            {index + 1}
                                                        </span>
                                                        <input
                                                            className="input flex-1"
                                                            placeholder="Name *"
                                                            value={recipient.name}
                                                            onChange={(e) => updateClaimRecipient(index, 'name', e.target.value)}
                                                        />
                                                        <input
                                                            className="input flex-1"
                                                            placeholder="@handle"
                                                            value={recipient.handle}
                                                            onChange={(e) => updateClaimRecipient(index, 'handle', e.target.value)}
                                                        />
                                                        <input
                                                            className="input w-28"
                                                            type="number"
                                                            placeholder="Amount"
                                                            value={recipient.amount || formData.fixedAmount}
                                                            onChange={(e) => updateClaimRecipient(index, 'amount', e.target.value)}
                                                        />
                                                        {formData.claimRecipients.length > 1 && (
                                                            <button
                                                                onClick={() => removeClaimRecipient(index)}
                                                                className="p-2 text-error-500 hover:bg-error-500/10 rounded-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addClaimRecipient}
                                            className="mt-4"
                                            leftIcon={<Plus className="w-4 h-4" />}
                                        >
                                            Add Recipient
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between mt-8"
            >
                <Button
                    variant="ghost"
                    onClick={() => setStep((s) => (s - 1) as Step)}
                    disabled={step === 1}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Back
                </Button>

                {step < 3 ? (
                    <Button
                        onClick={() => setStep((s) => (s + 1) as Step)}
                        disabled={!canProceed()}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        className="px-8"
                    >
                        Continue
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        className="px-8 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Batch'}
                    </Button>
                )}
            </motion.div>
        </div>
    );
}
