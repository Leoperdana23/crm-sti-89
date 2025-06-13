
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import ProductCategories from '@/pages/ProductCategories';
import ModernPublicCatalog from '@/components/PublicCatalog/ModernPublicCatalog';
import ResellerCatalog from '@/pages/ResellerCatalog';
import Customers from '@/pages/Customers';
import Users from '@/pages/Users';
import Branches from '@/pages/Branches';
import Resellers from '@/pages/Resellers';
import Orders from '@/pages/Orders';
import Sales from '@/pages/Sales';
import ResellerAuth from '@/pages/ResellerAuth';
import FollowUp from '@/pages/FollowUp';
import Reports from '@/pages/Reports';
import Survey from '@/pages/Survey';
import PublicSurvey from '@/pages/PublicSurvey';
import WorkProcess from '@/pages/WorkProcess';
import Birthday from '@/pages/Birthday';
import DealHistory from '@/pages/DealHistory';
import RolePermissions from '@/pages/RolePermissions';
import NotFound from '@/pages/NotFound';
import ModernLayout from '@/components/Layout/ModernLayout';
import ModernDashboard from '@/components/Dashboard/ModernDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reseller-auth" element={<ResellerAuth />} />
              <Route path="/catalog/:token" element={<ModernPublicCatalog />} />
              <Route path="/produk" element={<ResellerCatalog />} />
              <Route path="/survey/:token" element={<PublicSurvey />} />
              <Route path="/public-survey/:token" element={<PublicSurvey />} />
              
              {/* Protected routes with modern layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <ModernDashboard />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/categories" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <ProductCategories />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Customers />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Users />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/branches" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Branches />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/resellers" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Resellers />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Orders />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/sales" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Sales />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/follow-up" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <FollowUp />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Reports />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/survey" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Survey />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/work-process" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <WorkProcess />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/birthday" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <Birthday />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/deal-history" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <DealHistory />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              <Route path="/role-permissions" element={
                <ProtectedRoute>
                  <ModernLayout>
                    <RolePermissions />
                  </ModernLayout>
                </ProtectedRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
