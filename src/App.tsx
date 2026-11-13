import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import UserAddressesPage from './pages/UserAddressesPage';
import CartPage from './pages/CartPage';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';

const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

function App() {
  return (
    <>
      <Routes>
        {/* Public routes — redirect to /home if already authenticated */}
        <Route element={<PublicRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* Protected routes — redirect to /auth if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/addresses" element={<UserAddressesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={(
              <Suspense fallback={<div className="min-h-screen bg-[#fbfaf8] px-4 py-12 text-center text-sm text-neutral-500" role="status">Loading secure checkout…</div>}>
                <CheckoutPage />
              </Suspense>
            )}
          />
        </Route>

        {/* Fallback redirects */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <MobileBottomNav />
    </>
  );
}

export default App;
