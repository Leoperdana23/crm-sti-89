
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Auth from './pages/Auth';
import SalesAuth from './pages/SalesAuth';
import ResellerAuth from './pages/ResellerAuth';
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
import Attendance from './pages/Attendance';
import AttendanceApp from './pages/AttendanceApp';
import ResellerApp from './pages/ResellerApp';
import PublicCatalog from './pages/PublicCatalog';
import ResellerCatalog from './pages/ResellerCatalog';
import PublicSurvey from './pages/PublicSurvey';
import ProductCatalog from './pages/ProductCatalog';
import ProductCategories from './pages/ProductCategories';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ProductCatalogCRM from './pages/ProductCatalogCRM';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sales-auth" element={<SalesAuth />} />
            <Route path="/reseller-auth" element={<ResellerAuth />} />
            <Route path="/attendance-app" element={<AttendanceApp />} />
            <Route path="/reseller-app" element={<ResellerApp />} />
            <Route path="/produk" element={<PublicCatalog />} />
            <Route path="/reseller-catalog" element={<ResellerCatalog />} />
            <Route path="/survei/:token" element={<PublicSurvey />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/product-catalog-crm" element={<ProtectedRoute><ProductCatalogCRM /></ProtectedRoute>} />
            <Route path="/product-catalog" element={<ProtectedRoute><ProductCatalog /></ProtectedRoute>} />
            <Route path="/product-categories" element={<ProtectedRoute><ProductCategories /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/resellers" element={<ProtectedRoute><Resellers /></ProtectedRoute>} />
            <Route path="/follow-up" element={<ProtectedRoute><FollowUp /></ProtectedRoute>} />
            <Route path="/work-process" element={<ProtectedRoute><WorkProcess /></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
            <Route path="/deal-history" element={<ProtectedRoute><DealHistory /></ProtectedRoute>} />
            <Route path="/birthday" element={<ProtectedRoute><Birthday /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/role-permissions" element={<ProtectedRoute><RolePermissions /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path="/branches" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
