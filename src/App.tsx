import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard/Dashboard';
import UsersListPage from './pages/Users/UsersList';
import UserDetailsPage from './pages/Users/UserDetails';
import RestaurantsListPage from './pages/Restaurants/RestaurantsList';
import RestaurantDetailsPage from './pages/Restaurants/RestaurantDetails';
import PendingApprovalPage from './pages/Restaurants/PendingApproval';
import OrdersListPage from './pages/Orders/OrdersList';
import OrderDetailsPage from './pages/Orders/OrderDetails';
import CategoriesListPage from './pages/Categories/CategoriesList';
import CouponsListPage from './pages/Coupons/CouponsList';
import ReportsPage from './pages/Reports/Reports';
import SettingsPage from './pages/Settings/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { appTheme } from './theme/theme';
// Website pages
import HomePage from './pages/website/Home';
import PrivacyPage from './pages/website/Privacy';
import TermsPage from './pages/website/Terms';
import FAQPage from './pages/website/FAQ';
import ContactPage from './pages/website/Contact';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          direction: 'rtl',
        }}
      >
        <Routes>
          {/* Website routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Panel routes (protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <UsersListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <Layout>
                  <RestaurantsListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <RestaurantDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/pending"
            element={
              <ProtectedRoute>
                <Layout>
                  <PendingApprovalPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrdersListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrderDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoriesListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coupons"
            element={
              <ProtectedRoute>
                <Layout>
                  <CouponsListPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

export default App;
