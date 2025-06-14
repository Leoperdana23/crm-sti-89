
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  id_number?: string;
  needs?: string;
  notes?: string;
  status: string;
  customer_type?: string;
  company_name?: string;
  birth_date?: string;
  deal_date?: string;
  branch_id?: string;
  sales_id?: string;
  survey_status?: string;
  work_status?: string;
  work_start_date?: string;
  work_completed_date?: string;
  work_notes?: string;
  assigned_employees?: string;
  estimated_days?: number;
  payment_terms?: number;
  credit_limit?: number;
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      console.log('Customers fetched successfully:', data?.length);
      return data as Customer[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};
