
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
  status: 'Prospek' | 'Follow-up' | 'Deal' | 'Tidak Jadi';
  survey_status?: 'sudah_disurvei' | 'belum_disurvei';
  branch_id?: string;
  sales_id?: string;
  deal_date?: string;
  estimated_days?: number;
  work_start_date?: string;
  work_completed_date?: string;
  work_status?: 'not_started' | 'in_progress' | 'completed';
  work_notes?: string;
  assigned_employees?: string[];
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
  interactions: any[];
}

export const useCustomers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      
      // Transform data to match our Customer interface
      const customersWithInteractions = data?.map(customer => ({
        ...customer,
        status: customer.status as 'Prospek' | 'Follow-up' | 'Deal' | 'Tidak Jadi',
        survey_status: customer.survey_status as 'sudah_disurvei' | 'belum_disurvei' | undefined,
        work_status: customer.work_status as 'not_started' | 'in_progress' | 'completed' | undefined,
        assigned_employees: customer.assigned_employees ? 
          (typeof customer.assigned_employees === 'string' ? 
            customer.assigned_employees.split(',').map(e => e.trim()) : 
            customer.assigned_employees) : [],
        interactions: []
      })) || [];

      return customersWithInteractions as Customer[];
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'branches' | 'sales' | 'interactions'>) => {
      console.log('Creating customer:', customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          assigned_employees: customerData.assigned_employees?.join(', ')
        })
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

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<Customer>) => {
      console.log('Updating customer:', data.id, data);
      
      const { id, ...customerData } = data;
      const updateData = {
        ...customerData,
        assigned_employees: customerData.assigned_employees?.join(', '),
        updated_at: new Date().toISOString()
      };
      
      const { data: result, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      console.log('Customer updated successfully');
      return result;
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

  const deleteCustomerMutation = useMutation({
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

  const deleteCustomersByNameMutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('Deleting customers by name:', name);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .ilike('name', name);

      if (error) {
        console.error('Error deleting customers by name:', error);
        throw error;
      }

      console.log('Customers deleted successfully');
      return name;
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
      console.error('Error deleting customers by name:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus customer',
        variant: 'destructive',
      });
    },
  });

  const getCustomersByStatus = (status: Customer['status']) => {
    return query.data?.filter(customer => customer.status === status) || [];
  };

  const getStatsByBranch = () => {
    const customers = query.data || [];
    const stats: Record<string, any> = {};
    
    customers.forEach(customer => {
      const branchId = customer.branch_id || 'no_branch';
      if (!stats[branchId]) {
        stats[branchId] = {
          total: 0,
          prospek: 0,
          followUp: 0,
          deal: 0,
          tidakJadi: 0
        };
      }
      
      stats[branchId].total += 1;
      stats[branchId][customer.status.toLowerCase().replace('-', '')] += 1;
    });
    
    return stats;
  };

  const cancelWorkProcess = async (customerId: string) => {
    await updateCustomerMutation.mutateAsync({
      id: customerId,
      work_status: 'not_started',
      work_start_date: undefined,
      work_completed_date: undefined,
      work_notes: undefined
    });
  };

  return {
    customers: query.data || [],
    loading: query.isLoading,
    error: query.error,
    addCustomer: createCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    deleteCustomersByName: deleteCustomersByNameMutation.mutateAsync,
    getCustomersByStatus,
    getStatsByBranch,
    cancelWorkProcess,
    ...query
  };
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'branches' | 'sales' | 'interactions'>) => {
      console.log('Creating customer:', customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          assigned_employees: customerData.assigned_employees?.join(', ')
        })
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
      
      const updateData = {
        ...customerData,
        assigned_employees: customerData.assigned_employees?.join(', '),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
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
