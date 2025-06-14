
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Resellers from "./pages/Resellers";
import FollowUp from "./pages/FollowUp";
import WorkProcess from "./pages/WorkProcess";
import Survey from "./pages/Survey";
import DealHistory from "./pages/DealHistory";
import Birthday from "./pages/Birthday";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import RolePermissions from "./pages/RolePermissions";
import Sales from "./pages/Sales";
import Branches from "./pages/Branches";
import SalesAuth from "./pages/SalesAuth";
import ResellerApp from "./pages/ResellerApp";
import PublicSurvey from "./pages/PublicSurvey";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// SEDEKAT APP Pages
import ProductManagement from "./pages/SedekatApp/ProductManagement";
import CatalogManagement from "./pages/SedekatApp/CatalogManagement";
import ResellerManagement from "./pages/SedekatApp/ResellerManagement";
import OrderManagement from "./pages/SedekatApp/OrderManagement";
import Commission from "./pages/SedekatApp/Commission";
import AppSettings from "./pages/SedekatApp/AppSettings";
import ContactHelp from "./pages/SedekatApp/ContactHelp";
import Statistics from "./pages/SedekatApp/Statistics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/sales-auth" element={<SalesAuth />} />
                <Route path="/reseller-app" element={<ResellerApp />} />
                <Route path="/public-survey" element={<PublicSurvey />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
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
                
                <Route path="/customers" element={
                  <ProtectedRoute>
                    <Layout>
                      <Customers />
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
                
                <Route path="/follow-up" element={
                  <ProtectedRoute>
                    <Layout>
                      <FollowUp />
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
                
                <Route path="/survey" element={
                  <ProtectedRoute>
                    <Layout>
                      <Survey />
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
                
                <Route path="/birthday" element={
                  <ProtectedRoute>
                    <Layout>
                      <Birthday />
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
                
                <Route path="/users" element={
                  <ProtectedRoute>
                    <Layout>
                      <Users />
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
                
                <Route path="/sales" element={
                  <ProtectedRoute>
                    <Layout>
                      <Sales />
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

                {/* SEDEKAT APP Routes */}
                <Route path="/sedekat-app/product-management" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProductManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/sedekat-app/catalog-management" element={
                  <ProtectedRoute>
                    <Layout>
                      <CatalogManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/sedekat-app/reseller-management" element={
                  <ProtectedRoute>
                    <Layout>
                      <ResellerManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/sedekat-app/order-management" element={
                  <ProtectedRoute>
                    <Layout>
                      <OrderManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/sedekat-app/commission" element={
                  <ProtectedRoute>
                    <Layout>
                      <Commission />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/sedekat-app/app-settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <AppSettings />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/sedekat-app/contact-help" element={
                  <ProtectedRoute>
                    <Layout>
                      <ContactHelp />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/sedekat-app/statistics" element={
                  <ProtectedRoute>
                    <Layout>
                      <Statistics />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
