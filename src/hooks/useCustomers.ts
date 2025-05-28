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
        .select('*')
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
        status: customer.status as Customer['status'], // Type assertion for status
        interactions: [] // We'll load interactions separately if needed
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
          deal_date: customerData.dealDate
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
          status: data.status as Customer['status'], // Type assertion for status
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
          deal_date: updates.dealDate
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
          status: data.status as Customer['status'], // Type assertion for status
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

  const getStats = () => {
    return {
      total: customers.length,
      prospek: customers.filter(c => c.status === 'Prospek').length,
      followUp: customers.filter(c => c.status === 'Follow-up').length,
      deal: customers.filter(c => c.status === 'Deal').length,
      tidakJadi: customers.filter(c => c.status === 'Tidak Jadi').length,
    };
  };

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomersByStatus,
    getStats,
    refreshCustomers: fetchCustomers
  };
};
