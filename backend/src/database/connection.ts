import mongoose from 'mongoose';
import { CONFIG } from '../config';

export async function connectDatabase(): Promise<void> {
    try {
        await mongoose.connect(CONFIG.databaseUrl, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

export { mongoose };
