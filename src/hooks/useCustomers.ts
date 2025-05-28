
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';

// Extend the Supabase customer type to include assigned_employees
type CustomerWithAssignedEmployees = any & {
  assigned_employees?: string | null;
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          branches (
            id,
            name,
            code
          ),
          sales (
            id,
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        return;
      }

      // Transform the data to match our Customer interface
      const transformedCustomers: Customer[] = (data || []).map((customer: CustomerWithAssignedEmployees) => ({
        ...customer,
        assigned_employees: customer.assigned_employees ? JSON.parse(customer.assigned_employees) : [],
        interactions: []
      }));

      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error in fetchCustomers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'interactions'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          birth_date: customerData.birth_date,
          id_number: customerData.id_number,
          needs: customerData.needs,
          notes: customerData.notes,
          status: customerData.status,
          deal_date: customerData.deal_date,
          branch_id: customerData.branch_id,
          sales_id: customerData.sales_id === 'no-sales' ? null : customerData.sales_id,
          survey_status: customerData.status === 'Deal' ? 'belum_disurvei' : null,
          work_status: customerData.status === 'Deal' ? 'not_started' : null,
          assigned_employees: customerData.assigned_employees ? JSON.stringify(customerData.assigned_employees) : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding customer:', error);
        throw error;
      }

      if (data) {
        const customerWithAssigned = data as CustomerWithAssignedEmployees;
        const newCustomer: Customer = {
          ...customerWithAssigned,
          assigned_employees: customerWithAssigned.assigned_employees ? JSON.parse(customerWithAssigned.assigned_employees) : [],
          interactions: []
        };
        
        setCustomers(prev => [newCustomer, ...prev]);
        return newCustomer;
      }
    } catch (error) {
      console.error('Error in addCustomer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          phone: updates.phone,
          address: updates.address,
          birth_date: updates.birth_date,
          id_number: updates.id_number,
          needs: updates.needs,
          notes: updates.notes,
          status: updates.status,
          deal_date: updates.deal_date,
          branch_id: updates.branch_id,
          sales_id: updates.sales_id === 'no-sales' ? null : updates.sales_id,
          survey_status: updates.status === 'Deal' ? 'belum_disurvei' : updates.survey_status,
          work_status: updates.work_status,
          work_start_date: updates.work_start_date,
          work_completed_date: updates.work_completed_date,
          work_notes: updates.work_notes,
          estimated_days: updates.estimated_days,
          assigned_employees: updates.assigned_employees ? JSON.stringify(updates.assigned_employees) : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      if (data) {
        const customerWithAssigned = data as CustomerWithAssignedEmployees;
        const updatedCustomer: Customer = {
          ...customerWithAssigned,
          assigned_employees: customerWithAssigned.assigned_employees ? JSON.parse(customerWithAssigned.assigned_employees) : [],
          interactions: []
        };

        setCustomers(prev => 
          prev.map(customer => 
            customer.id === id ? updatedCustomer : customer
          )
        );
      }
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }

      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      throw error;
    }
  };

  const getCustomersByStatus = (status: Customer['status']) => {
    return customers.filter(customer => customer.status === status);
  };

  const getCustomersByBranch = (branchId: string) => {
    return customers.filter(customer => customer.branch_id === branchId);
  };

  const getCustomersBySales = (salesId: string) => {
    return customers.filter(customer => customer.sales_id === salesId);
  };

  const getStats = () => {
    return {
      total: customers.length,
      prospek: customers.filter(c => c.status === 'Prospek').length,
      followUp: customers.filter(c => c.status === 'Follow-up').length,
      deal: customers.filter(c => c.status === 'Deal').length,
      tidakJadi: customers.filter(c => c.status === 'Tidak Jadi').length,
    };
  };

  const getStatsByBranch = (branchId?: string) => {
    const filteredCustomers = branchId 
      ? customers.filter(c => c.branch_id === branchId)
      : customers;

    return {
      total: filteredCustomers.length,
      prospek: filteredCustomers.filter(c => c.status === 'Prospek').length,
      followUp: filteredCustomers.filter(c => c.status === 'Follow-up').length,
      deal: filteredCustomers.filter(c => c.status === 'Deal').length,
      tidakJadi: filteredCustomers.filter(c => c.status === 'Tidak Jadi').length,
    };
  };

  const getStatsBySales = (salesId?: string) => {
    const filteredCustomers = salesId 
      ? customers.filter(c => c.sales_id === salesId)
      : customers;

    return {
      total: filteredCustomers.length,
      prospek: filteredCustomers.filter(c => c.status === 'Prospek').length,
      followUp: filteredCustomers.filter(c => c.status === 'Follow-up').length,
      deal: filteredCustomers.filter(c => c.status === 'Deal').length,
      tidakJadi: filteredCustomers.filter(c => c.status === 'Tidak Jadi').length,
    };
  };

  const getSalesPerformance = () => {
    const salesData: Record<string, { deals: number; prospects: number; followUps: number }> = {};
    
    customers.forEach(customer => {
      if (customer.sales_id) {
        if (!salesData[customer.sales_id]) {
          salesData[customer.sales_id] = { deals: 0, prospects: 0, followUps: 0 };
        }
        
        switch (customer.status) {
          case 'Deal':
            salesData[customer.sales_id].deals++;
            break;
          case 'Prospek':
            salesData[customer.sales_id].prospects++;
            break;
          case 'Follow-up':
            salesData[customer.sales_id].followUps++;
            break;
        }
      }
    });
    
    return salesData;
  };

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomersByStatus,
    getCustomersByBranch,
    getCustomersBySales,
    getStats,
    getStatsByBranch,
    getStatsBySales,
    getSalesPerformance,
    refreshCustomers: fetchCustomers
  };
};
