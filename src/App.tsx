
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Branches from './pages/Branches';
import Users from './pages/Users';
import RolePermissions from './pages/RolePermissions';
import FollowUp from './pages/FollowUp';
import WorkProcess from './pages/WorkProcess';
import Survey from './pages/Survey';
import DealHistory from './pages/DealHistory';
import Birthday from './pages/Birthday';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import WarrantyManagement from './pages/WarrantyManagement';
import SedekatAppProductManagement from './pages/SedekatApp/ProductManagement';
import SedekatAppCatalogManagement from './pages/SedekatApp/CatalogManagement';
import SedekatAppResellerManagement from './pages/SedekatApp/ResellerManagement';
import SedekatAppOrderManagement from './pages/SedekatApp/OrderManagement';
import SedekatAppCommission from './pages/SedekatApp/Commission';
import SedekatAppSettings from './pages/SedekatApp/AppSettings';
import SedekatAppContactHelp from './pages/SedekatApp/ContactHelp';
import SedekatAppStatistics from './pages/SedekatApp/Statistics';
import Resellers from './pages/Resellers';
import ProgramPromo from './pages/SedekatApp/ProgramPromo';
import ResellerApp from './pages/ResellerApp';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/reseller-app" element={<ResellerApp />} />
            <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Layout><Sales /></Layout></ProtectedRoute>} />
            <Route path="/branches" element={<ProtectedRoute><Layout><Branches /></Layout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
            <Route path="/role-permissions" element={<ProtectedRoute><Layout><RolePermissions /></Layout></ProtectedRoute>} />
            <Route path="/follow-up" element={<ProtectedRoute><Layout><FollowUp /></Layout></ProtectedRoute>} />
            <Route path="/work-process" element={<ProtectedRoute><Layout><WorkProcess /></Layout></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute><Layout><Survey /></Layout></ProtectedRoute>} />
            <Route path="/deal-history" element={<ProtectedRoute><Layout><DealHistory /></Layout></ProtectedRoute>} />
            <Route path="/birthday" element={<ProtectedRoute><Layout><Birthday /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/warranty-management" element={<ProtectedRoute><Layout><WarrantyManagement /></Layout></ProtectedRoute>} />
            <Route path="/resellers" element={<ProtectedRoute><Layout><Resellers /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/product-management" element={<ProtectedRoute><Layout><SedekatAppProductManagement /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/catalog-management" element={<ProtectedRoute><Layout><SedekatAppCatalogManagement /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/reseller-management" element={<ProtectedRoute><Layout><SedekatAppResellerManagement /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/order-management" element={<ProtectedRoute><Layout><SedekatAppOrderManagement /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/commission" element={<ProtectedRoute><Layout><SedekatAppCommission /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/app-settings" element={<ProtectedRoute><Layout><SedekatAppSettings /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/contact-help" element={<ProtectedRoute><Layout><SedekatAppContactHelp /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/statistics" element={<ProtectedRoute><Layout><SedekatAppStatistics /></Layout></ProtectedRoute>} />
            <Route path="/sedekat-app/program-promo" element={<ProtectedRoute><Layout><ProgramPromo /></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
