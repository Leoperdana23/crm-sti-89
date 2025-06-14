
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Interaction {
  id: string;
  customer_id: string;
  type: 'call' | 'whatsapp' | 'email' | 'meeting';
  notes: string;
  date: string;
  follow_up_date?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  id_number?: string;
  needs?: string;
  notes?: string;
  status: 'Prospek' | 'Follow-up' | 'Deal' | 'Tidak Jadi';
  customer_type?: string;
  company_name?: string;
  birth_date?: string;
  deal_date?: string;
  branch_id?: string;
  sales_id?: string;
  survey_status?: 'sudah_disurvei' | 'belum_disurvei';
  work_status?: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  work_start_date?: string;
  work_completed_date?: string;
  work_notes?: string;
  assigned_employees?: string[];
  estimated_days?: number;
  payment_terms?: number;
  credit_limit?: number;
  created_at: string;
  updated_at: string;
  interactions: Interaction[];
}

export const useCustomers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          interactions (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      console.log('Customers fetched successfully:', data?.length);
      
      // Transform assigned_employees from string to array if needed
      const transformedData = data?.map(customer => ({
        ...customer,
        assigned_employees: customer.assigned_employees 
          ? (typeof customer.assigned_employees === 'string' 
              ? customer.assigned_employees.split(',').map(e => e.trim()).filter(e => e)
              : customer.assigned_employees)
          : [],
        interactions: customer.interactions || []
      }));
      
      return transformedData as Customer[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'interactions'>) => {
    const dataToInsert = {
      ...customerData,
      assigned_employees: customerData.assigned_employees?.join(',') || null
    };
    
    const { data, error } = await supabase
      .from('customers')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    toast({
      title: "Berhasil",
      description: "Pelanggan berhasil ditambahkan",
    });
    
    return data;
  };

  const updateCustomer = async ({ id, ...updateData }: Partial<Customer> & { id: string }) => {
    const { interactions, ...customerData } = updateData;
    
    const dataToUpdate = {
      ...customerData,
      assigned_employees: customerData.assigned_employees?.join(',') || null
    };
    
    const { data, error } = await supabase
      .from('customers')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    toast({
      title: "Berhasil",
      description: "Pelanggan berhasil diperbarui",
    });
    
    return data;
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    toast({
      title: "Berhasil",
      description: "Pelanggan berhasil dihapus",
    });
  };

  const deleteCustomersByName = async (name: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .ilike('name', name);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    toast({
      title: "Berhasil",
      description: `Pelanggan dengan nama "${name}" berhasil dihapus`,
    });
  };

  const getCustomersByStatus = (status: string) => {
    return (data || []).filter(customer => customer.status === status);
  };

  const cancelWorkProcess = async (customerId: string) => {
    const { error } = await supabase
      .from('customers')
      .update({ 
        work_status: 'cancelled',
        work_notes: 'Proses kerja dibatalkan' 
      })
      .eq('id', customerId);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    toast({
      title: "Berhasil",
      description: "Proses kerja berhasil dibatalkan",
    });
  };

  return {
    customers: data || [],
    loading: isLoading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    deleteCustomersByName,
    getCustomersByStatus,
    cancelWorkProcess,
  };
};
