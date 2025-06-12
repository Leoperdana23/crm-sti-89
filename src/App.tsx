
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import ProductCatalog from '@/pages/ProductCatalog';
import ProductCategories from '@/pages/ProductCategories';
import PublicCatalog from '@/pages/PublicCatalog';
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
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reseller-auth" element={<ResellerAuth />} />
            <Route path="/catalog/:token" element={<PublicCatalog />} />
            <Route path="/survey/:token" element={<PublicSurvey />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/catalog" element={
              <ProtectedRoute>
                <Layout>
                  <ProductCatalog />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <Layout>
                  <ProductCategories />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/branches" element={
              <ProtectedRoute>
                <Layout>
                  <Branches />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/resellers" element={
              <ProtectedRoute>
                <Layout>
                  <Resellers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute>
                <Layout>
                  <Sales />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/follow-up" element={
              <ProtectedRoute>
                <Layout>
                  <FollowUp />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/survey" element={
              <ProtectedRoute>
                <Layout>
                  <Survey />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/work-process" element={
              <ProtectedRoute>
                <Layout>
                  <WorkProcess />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/birthday" element={
              <ProtectedRoute>
                <Layout>
                  <Birthday />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/deal-history" element={
              <ProtectedRoute>
                <Layout>
                  <DealHistory />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/role-permissions" element={
              <ProtectedRoute>
                <Layout>
                  <RolePermissions />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
