
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
    sales_id: 'sales-1'
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
    sales_id: 'sales-1'
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
    sales_id: 'sales-2'
  }
];

export const useCustomers = () => {
  const query = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('Fetching customers...');
        
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
          console.log('Using fallback customer data');
          return fallbackCustomers;
        }

        if (data && data.length > 0) {
          console.log('Customers fetched successfully:', data);
          // Transform the data to match our interface
          const transformedData = data.map(customer => ({
            ...customer,
            interactions: customer.interactions || []
          }));
          return transformedData as Customer[];
        } else {
          console.log('No customers found, using fallback data');
          return fallbackCustomers;
        }
      } catch (error) {
        console.error('Network error fetching customers:', error);
        console.log('Using fallback customer data due to network error');
        return fallbackCustomers;
      }
    },
  });

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'interactions'>) => {
    console.log('Adding customer:', customerData);
    
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) {
      console.error('Error adding customer:', error);
      throw error;
    }

    console.log('Customer added successfully:', data);
    return data;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    console.log('Updating customer:', id, updates);
    
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }

    console.log('Customer updated successfully:', data);
    return data;
  };

  const deleteCustomer = async (id: string) => {
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
  };

  return {
    customers: query.data || fallbackCustomers,
    loading: query.isLoading,
    error: query.error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
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
