import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { AppLoader } from './components/AppLoader.js';

// Customer Pages
import { HomePage } from './pages/HomePage.js';
import { MenuPage } from './pages/MenuPage.js';
import { PizzaDetailsPage } from './pages/PizzaDetailsPage.js';
import { CustomPizzaBuilderPage } from './pages/CustomPizzaBuilderPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { OrderHistoryPage } from './pages/OrderHistoryPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { VerifyEmailPage } from './pages/VerifyEmailPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.js';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage.js';
import { AdminInventoryLogsPage } from './pages/admin/AdminInventoryLogsPage.js';
import { AdminAlertsPage } from './pages/admin/AdminAlertsPage.js';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EF] text-[#38251F] selection:bg-[#D92D20] selection:text-white">
      <ScrollToTop />
      <AppLoader isLoading={isLoading} />
      
      <Routes>
        {/* Dedicated Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Portal Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="logs" element={<AdminInventoryLogsPage />} />
          <Route path="alerts" element={<AdminAlertsPage />} />
        </Route>

        {/* Customer Storefront Routes (with Navbar & Footer) */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/pizza/:id" element={<PizzaDetailsPage />} />
                  <Route path="/builder" element={<CustomPizzaBuilderPage />} />
                  <Route path="/cart" element={<CartPage />} />

                  {/* Protected Customer Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <OrderTrackingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Auth & Verification Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};
