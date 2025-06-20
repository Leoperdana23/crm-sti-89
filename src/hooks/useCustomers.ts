
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
  status: 'Prospek' | 'Follow-up' | 'Cold' | 'Warm' | 'Hot' | 'Deal' | 'Tidak Jadi';
  customer_type?: string;
  company_name?: string;
  birth_date?: string;
  deal_date?: string;
  branch_id?: string;
  sales_id?: string;
  lead_source?: string;
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

  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'interactions'>) => {
      console.log('Adding customer with data:', customerData);
      
      const dataToInsert = {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        email: customerData.email || null,
        id_number: customerData.id_number || null,
        birth_date: customerData.birth_date || null,
        needs: customerData.needs || null,
        notes: customerData.notes || null,
        status: customerData.status,
        branch_id: customerData.branch_id,
        sales_id: customerData.sales_id,
        lead_source: customerData.lead_source,
        assigned_employees: customerData.assigned_employees?.join(',') || null,
        customer_type: customerData.customer_type || 'individual',
        company_name: customerData.company_name || null,
        deal_date: customerData.deal_date || null,
        payment_terms: customerData.payment_terms || 30,
        credit_limit: customerData.credit_limit || 0,
        survey_status: customerData.survey_status || 'belum_disurvei',
        work_status: customerData.work_status || null,
        work_start_date: customerData.work_start_date || null,
        work_completed_date: customerData.work_completed_date || null,
        work_notes: customerData.work_notes || null,
        estimated_days: customerData.estimated_days || null
      };
      
      const { data, error } = await supabase
        .from('customers')
        .insert([dataToInsert])
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
        title: "Berhasil",
        description: "Pelanggan berhasil ditambahkan",
      });
    },
    onError: (error) => {
      console.error('Error in addCustomer mutation:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan pelanggan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Customer> & { id: string }) => {
      console.log('Updating customer with ID:', id, 'Data:', updateData);
      
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
        title: "Berhasil",
        description: "Pelanggan berhasil diperbarui",
      });
    },
    onError: (error) => {
      console.error('Error in updateCustomer mutation:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui pelanggan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting customer with ID:', id);
      
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
        title: "Berhasil",
        description: "Pelanggan berhasil dihapus",
      });
    },
    onError: (error) => {
      console.error('Error in deleteCustomer mutation:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus pelanggan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  });

  const deleteCustomersByNameMutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('Deleting customers with name:', name);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .ilike('name', name);

      if (error) {
        console.error('Error deleting customers by name:', error);
        throw error;
      }
      
      console.log('Customers deleted successfully');
    },
    onSuccess: (_, name) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Berhasil",
        description: `Pelanggan dengan nama "${name}" berhasil dihapus`,
      });
    },
    onError: (error) => {
      console.error('Error in deleteCustomersByName mutation:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus pelanggan. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  });

  const cancelWorkProcessMutation = useMutation({
    mutationFn: async (customerId: string) => {
      console.log('Cancelling work process for customer:', customerId);
      
      const { error } = await supabase
        .from('customers')
        .update({ 
          work_status: 'cancelled',
          work_notes: 'Proses kerja dibatalkan' 
        })
        .eq('id', customerId);

      if (error) {
        console.error('Error cancelling work process:', error);
        throw error;
      }
      
      console.log('Work process cancelled successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Berhasil",
        description: "Proses kerja berhasil dibatalkan",
      });
    },
    onError: (error) => {
      console.error('Error in cancelWorkProcess mutation:', error);
      toast({
        title: "Error",
        description: "Gagal membatalkan proses kerja. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  });

  const getCustomersByStatus = (status: string) => {
    return (data || []).filter(customer => customer.status === status);
  };

  return {
    customers: data || [],
    loading: isLoading,
    error,
    addCustomer: addCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    deleteCustomer: deleteCustomerMutation.mutate,
    deleteCustomersByName: deleteCustomersByNameMutation.mutate,
    getCustomersByStatus,
    cancelWorkProcess: cancelWorkProcessMutation.mutate,
    isAddingCustomer: addCustomerMutation.isPending,
    isUpdatingCustomer: updateCustomerMutation.isPending,
    isDeletingCustomer: deleteCustomerMutation.isPending,
  };
};
