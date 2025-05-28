
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Payroll } from '@/types/employee';

export const usePayroll = () => {
  const [payrollRecords, setPayrollRecords] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .order('period_start', { ascending: false });

      if (error) {
        console.error('Error fetching payroll:', error);
        return;
      }

      setPayrollRecords(data || []);
    } catch (error) {
      console.error('Error in fetchPayroll:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const createPayroll = async (payrollData: Omit<Payroll, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('payroll')
        .insert(payrollData)
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .single();

      if (error) {
        console.error('Error creating payroll:', error);
        throw error;
      }

      if (data) {
        setPayrollRecords(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error in createPayroll:', error);
      throw error;
    }
  };

  const updatePayroll = async (id: string, updates: Partial<Payroll>) => {
    try {
      const { data, error } = await supabase
        .from('payroll')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .single();

      if (error) {
        console.error('Error updating payroll:', error);
        throw error;
      }

      if (data) {
        setPayrollRecords(prev => prev.map(p => p.id === id ? data : p));
      }
    } catch (error) {
      console.error('Error in updatePayroll:', error);
      throw error;
    }
  };

  return {
    payrollRecords,
    loading,
    createPayroll,
    updatePayroll,
    refreshPayroll: fetchPayroll
  };
};
