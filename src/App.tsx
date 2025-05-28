
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import FollowUp from "./pages/FollowUp";
import Survey from "./pages/Survey";
import Branches from "./pages/Branches";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import PublicSurvey from "./pages/PublicSurvey";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="follow-up" element={<FollowUp />} />
            <Route path="survey" element={<Survey />} />
            <Route path="branches" element={<Branches />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="/public-survey/:token" element={<PublicSurvey />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
