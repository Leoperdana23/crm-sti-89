import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';

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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        return;
      }

      // Transform the data to match our Customer interface
      const transformedCustomers: Customer[] = (data || []).map(customer => ({
        ...customer,
        birthDate: customer.birth_date,
        idNumber: customer.id_number,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        dealDate: customer.deal_date,
        branchId: customer.branch_id,
        salesName: customer.sales_name,
        surveyStatus: customer.survey_status as Customer['surveyStatus'],
        status: customer.status as Customer['status'],
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

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'interactions'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          phone: customerData.phone,
          address: customerData.address,
          birth_date: customerData.birthDate,
          id_number: customerData.idNumber,
          needs: customerData.needs,
          notes: customerData.notes,
          status: customerData.status,
          deal_date: customerData.dealDate,
          branch_id: customerData.branchId,
          sales_name: customerData.salesName,
          survey_status: customerData.status === 'Deal' ? 'belum_disurvei' : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding customer:', error);
        throw error;
      }

      if (data) {
        const newCustomer: Customer = {
          ...data,
          birthDate: data.birth_date,
          idNumber: data.id_number,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          dealDate: data.deal_date,
          branchId: data.branch_id,
          salesName: data.sales_name,
          surveyStatus: data.survey_status as Customer['surveyStatus'],
          status: data.status as Customer['status'],
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
          birth_date: updates.birthDate,
          id_number: updates.idNumber,
          needs: updates.needs,
          notes: updates.notes,
          status: updates.status,
          deal_date: updates.dealDate,
          branch_id: updates.branchId,
          sales_name: updates.salesName,
          survey_status: updates.status === 'Deal' ? 'belum_disurvei' : updates.surveyStatus
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      if (data) {
        const updatedCustomer: Customer = {
          ...data,
          birthDate: data.birth_date,
          idNumber: data.id_number,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          dealDate: data.deal_date,
          branchId: data.branch_id,
          salesName: data.sales_name,
          surveyStatus: data.survey_status as Customer['surveyStatus'],
          status: data.status as Customer['status'],
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
    return customers.filter(customer => customer.branchId === branchId);
  };

  const getCustomersBySales = (salesName: string) => {
    return customers.filter(customer => customer.salesName === salesName);
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
      ? customers.filter(c => c.branchId === branchId)
      : customers;

    return {
      total: filteredCustomers.length,
      prospek: filteredCustomers.filter(c => c.status === 'Prospek').length,
      followUp: filteredCustomers.filter(c => c.status === 'Follow-up').length,
      deal: filteredCustomers.filter(c => c.status === 'Deal').length,
      tidakJadi: filteredCustomers.filter(c => c.status === 'Tidak Jadi').length,
    };
  };

  const getStatsBySales = (salesName?: string) => {
    const filteredCustomers = salesName 
      ? customers.filter(c => c.salesName === salesName)
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
      if (customer.salesName) {
        if (!salesData[customer.salesName]) {
          salesData[customer.salesName] = { deals: 0, prospects: 0, followUps: 0 };
        }
        
        switch (customer.status) {
          case 'Deal':
            salesData[customer.salesName].deals++;
            break;
          case 'Prospek':
            salesData[customer.salesName].prospects++;
            break;
          case 'Follow-up':
            salesData[customer.salesName].followUps++;
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
