
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          user:app_users(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }

      setEmployees((data || []) as Employee[]);
    } catch (error) {
      console.error('Error in fetchEmployees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const addEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select(`
          *,
          user:app_users(full_name, email)
        `)
        .single();

      if (error) {
        console.error('Error adding employee:', error);
        throw error;
      }

      if (data) {
        setEmployees(prev => [data as Employee, ...prev]);
        return data as Employee;
      }
    } catch (error) {
      console.error('Error in addEmployee:', error);
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user:app_users(full_name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating employee:', error);
        throw error;
      }

      if (data) {
        setEmployees(prev => prev.map(emp => emp.id === id ? data as Employee : emp));
      }
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      throw error;
    }
  };

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    refreshEmployees: fetchEmployees
  };
};
