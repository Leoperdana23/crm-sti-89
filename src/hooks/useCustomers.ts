
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer, Interaction } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

export const useCustomers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('Fetching customers from database...');
        
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
          throw error;
        }

        console.log('Customers fetched successfully:', data?.length || 0, 'records');
        
        if (!data) {
          return [];
        }

        // Transform the data to match our interface
        const transformedData = data.map(customer => ({
          ...customer,
          interactions: (customer.interactions || []).map(interaction => ({
            ...interaction,
            customer_id: customer.id
          })),
          assigned_employees: customer.assigned_employees ? 
            (typeof customer.assigned_employees === 'string' ? 
              customer.assigned_employees.split(',').filter(Boolean) : 
              customer.assigned_employees) : []
        }));

        return transformedData as Customer[];
      } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
    },
  });

  const getCustomersByStatus = (status: string) => {
    const customers = query.data || [];
    return customers.filter(customer => customer.status === status);
  };

  const getStatsByBranch = (branchId?: string) => {
    const customers = query.data || [];
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
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('name', name);

    if (error) {
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const cancelWorkProcess = async (customerId: string) => {
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
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'interactions'>) => {
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
        throw error;
      }

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
      console.error('Error adding customer:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan pelanggan',
        variant: 'destructive',
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Customer> }) => {
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
        throw error;
      }

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
      console.error('Error updating customer:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui pelanggan',
        variant: 'destructive',
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Sukses',
        description: 'Pelanggan berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus pelanggan',
        variant: 'destructive',
      });
    },
  });

  return {
    customers: query.data || [],
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
      const { data, error } = await supabase
        .from('interactions')
        .insert(interactionData)
        .select()
        .single();

      if (error) {
        throw error;
      }

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
      console.error('Error adding interaction:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan interaksi',
        variant: 'destructive',
      });
    },
  });
};
