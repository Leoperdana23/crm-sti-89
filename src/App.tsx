
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import Orders from '@/pages/Orders';
import Reports from '@/pages/Reports';
import Users from '@/pages/Users';
import Sales from '@/pages/Sales';
import Branches from '@/pages/Branches';
import Birthday from '@/pages/Birthday';
import FollowUp from '@/pages/FollowUp';
import DealHistory from '@/pages/DealHistory';
import Survey from '@/pages/Survey';
import PublicSurvey from '@/pages/PublicSurvey';
import WorkProcess from '@/pages/WorkProcess';
import RolePermissions from '@/pages/RolePermissions';
import Resellers from '@/pages/Resellers';
import ResellerApp from '@/pages/ResellerApp';
import SalesAuth from '@/pages/SalesAuth';

// SEDEKAT App Pages
import ProductManagement from '@/pages/SedekatApp/ProductManagement';
import CatalogManagement from '@/pages/SedekatApp/CatalogManagement';
import ResellerManagement from '@/pages/SedekatApp/ResellerManagement';
import OrderManagement from '@/pages/SedekatApp/OrderManagement';
import Commission from '@/pages/SedekatApp/Commission';
import AppSettings from '@/pages/SedekatApp/AppSettings';
import ContactHelp from '@/pages/SedekatApp/ContactHelp';

import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Update document title
  document.title = 'Sistem Management PT STI';

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sales-auth" element={<SalesAuth />} />
            <Route path="/survey/:id" element={<PublicSurvey />} />
            <Route path="/reseller-app" element={<ResellerApp />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Customers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Orders />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Sales />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/branches"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Branches />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/birthday"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Birthday />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/follow-up"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FollowUp />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/deal-history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DealHistory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/survey"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Survey />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/work-process"
              element={
                <ProtectedRoute>
                  <Layout>
                    <WorkProcess />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/role-permissions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RolePermissions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/resellers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Resellers />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* SEDEKAT App Routes */}
            <Route
              path="/sedekat-app/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sedekat-app/catalog"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CatalogManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sedekat-app/resellers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ResellerManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sedekat-app/orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sedekat-app/commission"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Commission />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sedekat-app/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AppSettings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/sedekat-app/contact-help"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ContactHelp />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
