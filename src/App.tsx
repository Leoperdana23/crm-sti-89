
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import FollowUp from '@/pages/FollowUp';
import Survey from '@/pages/Survey';
import Sales from '@/pages/Sales';
import Branches from '@/pages/Branches';
import Reports from '@/pages/Reports';
import PublicSurvey from '@/pages/PublicSurvey';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/survey/:token" element={<PublicSurvey />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="follow-up" element={<FollowUp />} />
            <Route path="survey" element={<Survey />} />
            <Route path="sales" element={<Sales />} />
            <Route path="branches" element={<Branches />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
