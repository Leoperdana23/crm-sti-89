
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Resellers from "./pages/Resellers";
import WarrantyManagement from "./pages/WarrantyManagement";
import FollowUp from "./pages/FollowUp";
import WorkProcess from "./pages/WorkProcess";
import Survey from "./pages/Survey";
import DealHistory from "./pages/DealHistory";
import Birthday from "./pages/Birthday";
import Reports from "./pages/Reports";
import RolePermissions from "./pages/RolePermissions";
import UsersPage from "./pages/Users";
import Sales from "./pages/Sales";
import Branches from "./pages/Branches";
import ProductManagement from "./pages/SedekatApp/ProductManagement";
import CatalogManagement from "./pages/SedekatApp/CatalogManagement";
import ResellerManagement from "./pages/SedekatApp/ResellerManagement";
import OrderManagement from "./pages/SedekatApp/OrderManagement";
import Commission from "./pages/SedekatApp/Commission";
import AppSettings from "./pages/SedekatApp/AppSettings";
import ContactHelp from "./pages/SedekatApp/ContactHelp";
import Statistics from "./pages/SedekatApp/Statistics";
import SalesAuth from "./pages/SalesAuth";
import PublicSurvey from "./pages/PublicSurvey";
import ResellerApp from "./pages/ResellerApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sales-auth" element={<SalesAuth />} />
            <Route path="/public-survey/:token" element={<PublicSurvey />} />
            <Route path="/reseller-app/*" element={<ResellerApp />} />
            
            <Route element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/resellers" element={<Resellers />} />
              <Route path="/warranty-management" element={<WarrantyManagement />} />
              <Route path="/follow-up" element={<FollowUp />} />
              <Route path="/work-process" element={<WorkProcess />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/deal-history" element={<DealHistory />} />
              <Route path="/birthday" element={<Birthday />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/role-permissions" element={<RolePermissions />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/branches" element={<Branches />} />
              
              {/* SEDEKAT APP Routes */}
              <Route path="/sedekat-app/product-management" element={<ProductManagement />} />
              <Route path="/sedekat-app/catalog-management" element={<CatalogManagement />} />
              <Route path="/sedekat-app/reseller-management" element={<ResellerManagement />} />
              <Route path="/sedekat-app/order-management" element={<OrderManagement />} />
              <Route path="/sedekat-app/commission" element={<Commission />} />
              <Route path="/sedekat-app/app-settings" element={<AppSettings />} />
              <Route path="/sedekat-app/contact-help" element={<ContactHelp />} />
              <Route path="/sedekat-app/statistics" element={<Statistics />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
