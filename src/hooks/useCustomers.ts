import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  id_number?: string;
  birth_date?: string;
  company_name?: string;
  customer_type: string;
  needs?: string;
  status: string;
  survey_status?: string;
  branch_id?: string;
  sales_id?: string;
  deal_date?: string;
  estimated_days?: number;
  work_start_date?: string;
  work_completed_date?: string;
  work_status?: string;
  work_notes?: string;
  assigned_employees?: string;
  notes?: string;
  credit_limit: number;
  payment_terms: number;
  created_at: string;
  updated_at: string;
  branches?: {
    id: string;
    name: string;
  };
  sales?: {
    id: string;
    name: string;
  };
}

export const useCustomers = () => {
  const query = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers...');
      
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          branches (
            id,
            name
          ),
          sales (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      console.log('Customers fetched successfully:', data?.length);
      return data as Customer[];
    },
  });

  return {
    customers: query.data,
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'branches' | 'sales'>) => {
      console.log('Creating customer:', customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      console.log('Customer created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Sukses',
        description: 'Customer berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat customer',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...customerData }: Partial<Customer> & { id: string }) => {
      console.log('Updating customer:', id, customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      console.log('Customer updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Sukses',
        description: 'Customer berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating customer:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui customer',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerId: string) => {
      console.log('Deleting customer:', customerId);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }

      console.log('Customer deleted successfully');
      return customerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Sukses',
        description: 'Customer berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus customer',
        variant: 'destructive',
      });
    },
  });
};
