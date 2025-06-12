
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Interaction } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

// Fallback sample data
const fallbackCustomers: Customer[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 123, Jakarta',
    birth_date: '1985-05-15',
    id_number: '3174051505850001',
    needs: 'Sistem POS untuk toko',
    notes: 'Tertarik dengan paket lengkap',
    status: 'Prospek',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    interactions: [],
    branch_id: 'branch-1',
    sales_id: 'sales-1',
    assigned_employees: []
  },
  {
    id: '2',
    name: 'Siti Rahayu',
    phone: '081234567891',
    address: 'Jl. Gatot Subroto No. 456, Jakarta',
    birth_date: '1990-08-22',
    id_number: '3174052208900002',
    needs: 'Software inventory',
    notes: 'Sudah ada follow up',
    status: 'Follow-up',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deal_date: '2024-06-10',
    interactions: [],
    branch_id: 'branch-1',
    sales_id: 'sales-1',
    assigned_employees: []
  },
  {
    id: '3',
    name: 'Agus Wijaya',
    phone: '081234567892',
    address: 'Jl. Thamrin No. 789, Jakarta',
    birth_date: '1988-12-03',
    id_number: '3174050312880003',
    needs: 'Sistem kasir digital',
    notes: 'Deal confirmed',
    status: 'Deal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deal_date: '2024-06-05',
    work_status: 'completed',
    work_completed_date: '2024-06-15',
    interactions: [],
    branch_id: 'branch-2',
    sales_id: 'sales-2',
    assigned_employees: []
  }
];

export const useCustomers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('Fetching customers...');
        
        // Check connection first
        const { data: connectionTest, error: connectionError } = await supabase
          .from('customers')
          .select('count')
          .limit(1);

        if (connectionError) {
          console.error('Database connection error:', connectionError);
          console.log('Connection error details:', {
            code: connectionError.code,
            message: connectionError.message,
            details: connectionError.details,
            hint: connectionError.hint
          });
        }

        const { data, error } = await supabase
          .from('customers')
          .select(`
            *,
            interactions (
              id,
              type,
              notes,
              date,
              follow_up_date
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching customers:', error);
          console.log('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          console.log('Using fallback customer data due to error');
          return fallbackCustomers;
        }

        console.log('Raw customers data from database:', data);
        console.log('Number of customers returned:', data?.length || 0);

        if (data && data.length > 0) {
          console.log('Customers fetched successfully:', data);
          // Transform the data to match our interface
          const transformedData = data.map(customer => {
            console.log('Processing customer:', customer.name);
            return {
              ...customer,
              interactions: (customer.interactions || []).map(interaction => ({
                ...interaction,
                customer_id: customer.id
              })),
              assigned_employees: customer.assigned_employees ? 
                (typeof customer.assigned_employees === 'string' ? 
                  customer.assigned_employees.split(',').filter(Boolean) : 
                  customer.assigned_employees) : []
            };
          });
          console.log('Transformed customers data:', transformedData);
          return transformedData as Customer[];
        } else {
          console.log('No customers found in database, using fallback data');
          console.log('Database returned empty array or null');
          return fallbackCustomers;
        }
      } catch (error) {
        console.error('Network error fetching customers:', error);
        console.log('Network error details:', error);
        console.log('Using fallback customer data due to network error');
        return fallbackCustomers;
      }
    },
  });

  const getCustomersByStatus = (status: string) => {
    const customers = query.data || fallbackCustomers;
    console.log(`Getting customers by status: ${status}`, customers);
    return customers.filter(customer => customer.status === status);
  };

  const getStatsByBranch = (branchId?: string) => {
    const customers = query.data || fallbackCustomers;
    console.log(`Getting stats by branch: ${branchId}`, customers);
    const filteredCustomers = branchId ? 
      customers.filter(customer => customer.branch_id === branchId) : 
      customers;
    
    return {
      total: filteredCustomers.length,
      prospek: filteredCustomers.filter(c => c.status === 'Prospek').length,
      followUp: filteredCustomers.filter(c => c.status === 'Follow-up').length,
      deal: filteredCustomers.filter(c => c.status === 'Deal').length,
      tidakJadi: filteredCustomers.filter(c => c.status === 'Tidak Jadi').length
    };
  };

  const deleteCustomersByName = async (name: string) => {
    console.log('Deleting customers by name:', name);
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('name', name);

    if (error) {
      console.error('Error deleting customers by name:', error);
      throw error;
    }

    console.log('Customers deleted successfully by name');
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const cancelWorkProcess = async (customerId: string) => {
    console.log('Canceling work process for customer:', customerId);
    
    const { error } = await supabase
      .from('customers')
      .update({ 
        work_status: 'not_started',
        work_start_date: null,
        work_completed_date: null,
        work_notes: null
      })
      .eq('id', customerId);

    if (error) {
      console.error('Error canceling work process:', error);
      throw error;
    }

    console.log('Work process canceled successfully');
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'interactions'>) => {
      console.log('Adding customer:', customerData);
      
      // Convert assigned_employees array to string for database
      const dataForDB = {
        ...customerData,
        assigned_employees: customerData.assigned_employees?.join(',') || null
      };
      
      const { data, error } = await supabase
        .from('customers')
        .insert(dataForDB)
        .select()
        .single();

      if (error) {
        console.error('Error adding customer:', error);
        throw error;
      }

      console.log('Customer added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Sukses',
        description: 'Pelanggan berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error in addCustomer:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan pelanggan',
        variant: 'destructive',
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Customer> }) => {
      console.log('Updating customer:', id, updates);
      
      // Convert assigned_employees array to string for database if present
      const updatesForDB = {
        ...updates,
        ...(updates.assigned_employees && {
          assigned_employees: updates.assigned_employees.join(',')
        })
      };
      
      const { data, error } = await supabase
        .from('customers')
        .update(updatesForDB)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      console.log('Customer updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Sukses',
        description: 'Pelanggan berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error in updateCustomer:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui pelanggan',
        variant: 'destructive',
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting customer:', id);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }

      console.log('Customer deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Sukses',
        description: 'Pelanggan berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error in deleteCustomer:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus pelanggan',
        variant: 'destructive',
      });
    },
  });

  const deleteCustomersByName = async (name: string) => {
    console.log('Deleting customers by name:', name);
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('name', name);

    if (error) {
      console.error('Error deleting customers by name:', error);
      throw error;
    }

    console.log('Customers deleted successfully by name');
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const cancelWorkProcess = async (customerId: string) => {
    console.log('Canceling work process for customer:', customerId);
    
    const { error } = await supabase
      .from('customers')
      .update({ 
        work_status: 'not_started',
        work_start_date: null,
        work_completed_date: null,
        work_notes: null
      })
      .eq('id', customerId);

    if (error) {
      console.error('Error canceling work process:', error);
      throw error;
    }

    console.log('Work process canceled successfully');
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  return {
    customers: query.data || fallbackCustomers,
    loading: query.isLoading,
    error: query.error,
    getCustomersByStatus,
    getStatsByBranch,
    deleteCustomersByName,
    cancelWorkProcess,
    addCustomer: addCustomerMutation.mutateAsync,
    updateCustomer: (id: string, updates: Partial<Customer>) => 
      updateCustomerMutation.mutateAsync({ id, updates }),
    deleteCustomer: deleteCustomerMutation.mutateAsync,
    ...query
  };
};

export const useAddInteraction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interactionData: Omit<Interaction, 'id'>) => {
      console.log('Adding interaction:', interactionData);

      const { data, error } = await supabase
        .from('interactions')
        .insert(interactionData)
        .select()
        .single();

      if (error) {
        console.error('Error adding interaction:', error);
        throw error;
      }

      console.log('Interaction added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Sukses',
        description: 'Interaksi berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error in useAddInteraction:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan interaksi',
        variant: 'destructive',
      });
    },
  });
};
