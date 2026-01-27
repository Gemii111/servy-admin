import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import LoadingFallback from './components/common/LoadingFallback';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { appTheme } from './theme/theme';

// Lazy load pages for code splitting
// Website pages
const HomePage = lazy(() => import('./pages/website/Home'));
const PrivacyPage = lazy(() => import('./pages/website/Privacy'));
const TermsPage = lazy(() => import('./pages/website/Terms'));
const FAQPage = lazy(() => import('./pages/website/FAQ'));
const ContactPage = lazy(() => import('./pages/website/Contact'));
// Admin pages
const LoginPage = lazy(() => import('./pages/Login'));
const DashboardPage = lazy(() => import('./pages/Dashboard/Dashboard'));
const UsersListPage = lazy(() => import('./pages/Users/UsersList'));
const UserDetailsPage = lazy(() => import('./pages/Users/UserDetails'));
const RestaurantsListPage = lazy(() => import('./pages/Restaurants/RestaurantsList'));
const RestaurantDetailsPage = lazy(() => import('./pages/Restaurants/RestaurantDetails'));
const PendingApprovalPage = lazy(() => import('./pages/Restaurants/PendingApproval'));
const OrdersListPage = lazy(() => import('./pages/Orders/OrdersList'));
const OrderDetailsPage = lazy(() => import('./pages/Orders/OrderDetails'));
const CategoriesListPage = lazy(() => import('./pages/Categories/CategoriesList'));
const CouponsListPage = lazy(() => import('./pages/Coupons/CouponsList'));
const ReportsPage = lazy(() => import('./pages/Reports/Reports'));
const SettingsPage = lazy(() => import('./pages/Settings/Settings'));
const SendNotificationPage = lazy(() => import('./pages/Notifications/SendNotification'));
const NotificationHistoryPage = lazy(() => import('./pages/Notifications/NotificationHistory'));
const NotificationStatisticsPage = lazy(() => import('./pages/Notifications/NotificationStatistics'));
const NotificationTemplatesPage = lazy(() => import('./pages/Notifications/NotificationTemplates'));
const RewardsListPage = lazy(() => import('./pages/Rewards/RewardsList'));
const RewardsStatisticsPage = lazy(() => import('./pages/Rewards/RewardsStatistics'));
const RewardsHistoryPage = lazy(() => import('./pages/Rewards/RewardsHistory'));
const DriverRatingsListPage = lazy(() => import('./pages/DriverRatings/DriverRatingsList'));
const DriverRatingsStatisticsPage = lazy(() => import('./pages/DriverRatings/DriverRatingsStatistics'));

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
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <HomePage />
              </Suspense>
            } 
          />
          <Route 
            path="/privacy" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PrivacyPage />
              </Suspense>
            } 
          />
          <Route 
            path="/terms" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <TermsPage />
              </Suspense>
            } 
          />
          <Route 
            path="/faq" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <FAQPage />
              </Suspense>
            } 
          />
          <Route 
            path="/contact" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ContactPage />
              </Suspense>
            } 
          />
          
          {/* Login */}
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <DashboardPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <UsersListPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <UserDetailsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <RestaurantsListPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <RestaurantDetailsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants/pending"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <PendingApprovalPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <OrdersListPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <OrderDetailsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <CategoriesListPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coupons"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <CouponsListPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <ReportsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <SettingsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <SendNotificationPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <NotificationHistoryPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications/statistics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <NotificationStatisticsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications/templates"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <NotificationTemplatesPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <RewardsListPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards/statistics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <RewardsStatisticsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <RewardsHistoryPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-ratings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <DriverRatingsListPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-ratings/statistics"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingFallback />}>
                    <DriverRatingsStatisticsPage />
                  </Suspense>
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
