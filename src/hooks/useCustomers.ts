import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';

// Extend the Supabase customer type to include assigned_employees
type CustomerWithAssignedEmployees = any & {
  assigned_employees?: string | null;
};

// Fallback sample data
const fallbackCustomers: Customer[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    birth_date: '1985-05-15',
    id_number: '3171234567890123',
    needs: 'Aplikasi inventory management',
    notes: 'Customer potensial, butuh demo produk',
    status: 'Prospek',
    deal_date: null,
    branch_id: 'branch-1',
    sales_id: 'sales-1',
    survey_status: 'belum_disurvei',
    work_status: null,
    work_start_date: null,
    work_completed_date: null,
    work_notes: null,
    estimated_days: null,
    assigned_employees: [],
    interactions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Siti Rahayu',
    phone: '081987654321',
    address: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
    birth_date: '1990-08-22',
    id_number: '3172345678901234',
    needs: 'Website e-commerce',
    notes: 'Follow up setiap minggu',
    status: 'Follow-up',
    deal_date: null,
    branch_id: 'branch-1',
    sales_id: 'sales-1',
    survey_status: 'belum_disurvei',
    work_status: null,
    work_start_date: null,
    work_completed_date: null,
    work_notes: null,
    estimated_days: null,
    assigned_employees: [],
    interactions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Agus Wijaya',
    phone: '081122334455',
    address: 'Jl. Thamrin No. 789, Jakarta Pusat',
    birth_date: '1988-12-10',
    id_number: '3173456789012345',
    needs: 'Sistem POS',
    notes: 'Deal confirmed, mulai development',
    status: 'Deal',
    deal_date: '2024-06-10',
    branch_id: 'branch-1',
    sales_id: 'sales-1',
    survey_status: 'belum_disurvei',
    work_status: 'in_progress',
    work_start_date: '2024-06-12',
    work_completed_date: null,
    work_notes: 'Development progress 50%',
    estimated_days: 30,
    assigned_employees: ['dev-1', 'dev-2'],
    interactions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log('Fetching customers...');
      
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
        console.log('Using fallback customer data');
        setCustomers(fallbackCustomers);
        return;
      }

      if (data && data.length > 0) {
        // Transform the data to match our Customer interface
        const transformedCustomers: Customer[] = (data || []).map((customer: CustomerWithAssignedEmployees) => ({
          ...customer,
          assigned_employees: customer.assigned_employees ? JSON.parse(customer.assigned_employees) : [],
          interactions: []
        }));

        setCustomers(transformedCustomers);
      } else {
        console.log('No customers found, using fallback data');
        setCustomers(fallbackCustomers);
      }
    } catch (error) {
      console.error('Error in fetchCustomers:', error);
      console.log('Using fallback customer data due to network error');
      setCustomers(fallbackCustomers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'interactions'>) => {
    try {
      console.log('Adding customer with data:', customerData);
      
      // Ensure required fields are present
      if (!customerData.name?.trim()) {
        throw new Error('Nama harus diisi');
      }
      if (!customerData.phone?.trim()) {
        throw new Error('Nomor HP harus diisi');
      }
      if (!customerData.address?.trim()) {
        throw new Error('Alamat harus diisi');
      }
      if (!customerData.branch_id) {
        throw new Error('Cabang harus dipilih');
      }
      if (!customerData.sales_id) {
        throw new Error('Sales harus dipilih');
      }

      const insertData = {
        name: customerData.name.trim(),
        phone: customerData.phone.trim(),
        address: customerData.address.trim(),
        birth_date: customerData.birth_date && customerData.birth_date.trim() ? customerData.birth_date.trim() : null,
        id_number: customerData.id_number && customerData.id_number.trim() ? customerData.id_number.trim() : null,
        needs: customerData.needs && customerData.needs.trim() ? customerData.needs.trim() : null,
        notes: customerData.notes && customerData.notes.trim() ? customerData.notes.trim() : null,
        status: customerData.status,
        deal_date: customerData.deal_date || null,
        branch_id: customerData.branch_id,
        sales_id: customerData.sales_id,
        survey_status: customerData.status === 'Deal' ? 'belum_disurvei' : null,
        work_status: customerData.status === 'Deal' ? 'not_started' : null,
        assigned_employees: customerData.assigned_employees ? JSON.stringify(customerData.assigned_employees) : null
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('customers')
        .insert(insertData)
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
          sales_id: updates.sales_id,
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

  const deleteCustomersByName = async (name: string) => {
    try {
      // First, get all customers with the specified name
      const { data: customersToDelete, error: fetchError } = await supabase
        .from('customers')
        .select('id')
        .ilike('name', name);

      if (fetchError) {
        console.error('Error fetching customers by name:', fetchError);
        throw fetchError;
      }

      if (customersToDelete && customersToDelete.length > 0) {
        const customerIds = customersToDelete.map(customer => customer.id);

        // First delete all related surveys
        const { error: surveyError } = await supabase
          .from('surveys')
          .delete()
          .in('customer_id', customerIds);

        if (surveyError) {
          console.error('Error deleting related surveys:', surveyError);
          throw surveyError;
        }

        // Then delete the customers
        const { error: customerError } = await supabase
          .from('customers')
          .delete()
          .in('id', customerIds);

        if (customerError) {
          console.error('Error deleting customers by name:', customerError);
          throw customerError;
        }

        setCustomers(prev => prev.filter(customer => 
          customer.name.toLowerCase() !== name.toLowerCase()
        ));
      }
    } catch (error) {
      console.error('Error in deleteCustomersByName:', error);
      throw error;
    }
  };

  const cancelWorkProcess = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          work_status: null,
          work_start_date: null,
          work_completed_date: null,
          work_notes: null,
          estimated_days: null,
          assigned_employees: null
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) {
        console.error('Error canceling work process:', error);
        throw error;
      }

      if (data) {
        const customerWithAssigned = data as CustomerWithAssignedEmployees;
        const updatedCustomer: Customer = {
          ...customerWithAssigned,
          assigned_employees: [],
          interactions: []
        };

        setCustomers(prev => 
          prev.map(customer => 
            customer.id === customerId ? updatedCustomer : customer
          )
        );
      }
    } catch (error) {
      console.error('Error in cancelWorkProcess:', error);
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
    deleteCustomersByName,
    cancelWorkProcess,
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
