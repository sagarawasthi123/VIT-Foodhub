import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavouritesProvider } from './context/FavouritesContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Student pages
import { StudentHomePage } from './pages/student/StudentHomePage';
import { FoodCourtsPage } from './pages/student/FoodCourtsPage';
import { FoodCourtDetailPage } from './pages/student/FoodCourtDetailPage';
import { ShopMenuPage } from './pages/student/ShopMenuPage';
import { CartPage } from './pages/student/CartPage';
import { CheckoutPage } from './pages/student/CheckoutPage';
import { OrderConfirmationPage } from './pages/student/OrderConfirmationPage';
import { OrderHistoryPage } from './pages/student/OrderHistoryPage';
import { OrderTrackingPage } from './pages/student/OrderTrackingPage';
import { FavouritesPage } from './pages/student/FavouritesPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Shopkeeper pages
import { ShopkeeperDashboardPage } from './pages/shopkeeper/ShopkeeperDashboardPage';
import { ShopkeeperOrdersPage } from './pages/shopkeeper/ShopkeeperOrdersPage';
import { ShopkeeperMenuPage } from './pages/shopkeeper/ShopkeeperMenuPage';
import { ShopkeeperInventoryPage } from './pages/shopkeeper/ShopkeeperInventoryPage';
import { ShopkeeperTokenPage } from './pages/shopkeeper/ShopkeeperTokenPage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminFoodCourtsPage } from './pages/admin/AdminFoodCourtsPage';
import { AdminShopsPage } from './pages/admin/AdminShopsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavouritesProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                {/* Student routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/student" element={<StudentHomePage />} />
                  <Route path="/student/food-courts" element={<FoodCourtsPage />} />
                  <Route path="/student/food-courts/:id" element={<FoodCourtDetailPage />} />
                  <Route path="/student/shops/:id" element={<ShopMenuPage />} />
                  <Route path="/student/cart" element={<CartPage />} />
                  <Route path="/student/checkout" element={<CheckoutPage />} />
                  <Route path="/student/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/student/orders" element={<OrderHistoryPage />} />
                  <Route path="/student/orders/:id" element={<OrderTrackingPage />} />
                  <Route path="/student/favourites" element={<FavouritesPage />} />
                  <Route path="/student/notifications" element={<NotificationsPage />} />
                  <Route path="/student/profile" element={<ProfilePage />} />
                </Route>

                {/* Shopkeeper routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['shopkeeper']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/shopkeeper" element={<ShopkeeperDashboardPage />} />
                  <Route path="/shopkeeper/orders" element={<ShopkeeperOrdersPage />} />
                  <Route path="/shopkeeper/menu" element={<ShopkeeperMenuPage />} />
                  <Route path="/shopkeeper/inventory" element={<ShopkeeperInventoryPage />} />
                  <Route path="/shopkeeper/tokens" element={<ShopkeeperTokenPage />} />
                </Route>

                {/* Admin routes */}
                <Route
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/food-courts" element={<AdminFoodCourtsPage />} />
                  <Route path="/admin/shops" element={<AdminShopsPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/reports" element={<AdminReportsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </FavouritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
