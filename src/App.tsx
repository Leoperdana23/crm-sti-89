
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import Index from './pages/Index';
import Auth from './pages/Auth';
import SalesAuth from './pages/SalesAuth';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Resellers from './pages/Resellers';
import FollowUp from './pages/FollowUp';
import WorkProcess from './pages/WorkProcess';
import Survey from './pages/Survey';
import DealHistory from './pages/DealHistory';
import Birthday from './pages/Birthday';
import Reports from './pages/Reports';
import RolePermissions from './pages/RolePermissions';
import Users from './pages/Users';
import Sales from './pages/Sales';
import Branches from './pages/Branches';
import ResellerApp from './pages/ResellerApp';
import PublicCatalog from './pages/PublicCatalog';
import PublicSurvey from './pages/PublicSurvey';
import ProductCategories from './pages/ProductCategories';
import Suppliers from './pages/Suppliers';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ProductCatalogCRM from './pages/ProductCatalogCRM';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sales-auth" element={<SalesAuth />} />
              <Route path="/reseller-app" element={<ResellerApp />} />
              <Route path="/produk" element={<PublicCatalog />} />
              <Route path="/survei/:token" element={<PublicSurvey />} />
              
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/product-catalog-crm" element={<ProtectedRoute><Layout><ProductCatalogCRM /></Layout></ProtectedRoute>} />
              <Route path="/product-categories" element={<ProtectedRoute><Layout><ProductCategories /></Layout></ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute><Layout><Suppliers /></Layout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
              <Route path="/resellers" element={<ProtectedRoute><Layout><Resellers /></Layout></ProtectedRoute>} />
              <Route path="/follow-up" element={<ProtectedRoute><Layout><FollowUp /></Layout></ProtectedRoute>} />
              <Route path="/work-process" element={<ProtectedRoute><Layout><WorkProcess /></Layout></ProtectedRoute>} />
              <Route path="/survey" element={<ProtectedRoute><Layout><Survey /></Layout></ProtectedRoute>} />
              <Route path="/deal-history" element={<ProtectedRoute><Layout><DealHistory /></Layout></ProtectedRoute>} />
              <Route path="/birthday" element={<ProtectedRoute><Layout><Birthday /></Layout></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
              <Route path="/role-permissions" element={<ProtectedRoute><Layout><RolePermissions /></Layout></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><Layout><Sales /></Layout></ProtectedRoute>} />
              <Route path="/branches" element={<ProtectedRoute><Layout><Branches /></Layout></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
