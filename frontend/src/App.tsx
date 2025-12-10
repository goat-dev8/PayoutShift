import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import BatchListPage from './pages/admin/BatchListPage';
import NewBatchPage from './pages/admin/NewBatchPage';
import BatchDetailPage from './pages/admin/BatchDetailPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import PublicBatchPage from './pages/PublicBatchPage';
import ClaimPage from './pages/ClaimPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="batches/:slug" element={<PublicBatchPage />} />
                    <Route path="claim/:token" element={<ClaimPage />} />
                </Route>

                {/* Protected admin routes - requires wallet connection */}
                <Route path="/admin" element={<ProtectedRoute><Layout isAdmin /></ProtectedRoute>}>
                    <Route index element={<BatchListPage />} />
                    <Route path="batches" element={<BatchListPage />} />
                    <Route path="batches/new" element={<NewBatchPage />} />
                    <Route path="batches/:id" element={<BatchDetailPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

