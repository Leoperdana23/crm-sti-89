
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sales } from '@/types/sales';

export const useSales = () => {
  const [sales, setSales] = useState<Sales[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          branches (
            id,
            name,
            code
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching sales:', error);
        return;
      }

      setSales(data || []);
    } catch (error) {
      console.error('Error in fetchSales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const addSales = async (salesData: Omit<Sales, 'id' | 'created_at' | 'updated_at'> & { password?: string }) => {
    try {
      const insertData: any = {
        name: salesData.name,
        code: salesData.code,
        phone: salesData.phone,
        email: salesData.email,
        branch_id: salesData.branch_id === 'no-branch' ? null : salesData.branch_id,
        is_active: salesData.is_active
      };

      // Add password if provided - let the database trigger handle the hashing
      if (salesData.password && salesData.password.trim() !== '') {
        insertData.password_hash = salesData.password;
      }

      console.log('Adding sales with data:', insertData);

      const { data, error } = await supabase
        .from('sales')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error adding sales:', error);
        throw error;
      }

      if (data) {
        setSales(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error in addSales:', error);
      throw error;
    }
  };

  const updateSales = async (id: string, updates: Partial<Sales> & { password?: string }) => {
    try {
      const updateData: any = {
        name: updates.name,
        code: updates.code,
        phone: updates.phone,
        email: updates.email,
        branch_id: updates.branch_id === 'no-branch' ? null : updates.branch_id,
        is_active: updates.is_active
      };

      // Only update password if provided - let the database trigger handle the hashing
      if (updates.password && updates.password.trim() !== '') {
        updateData.password_hash = updates.password;
      }

      console.log('Updating sales with data:', updateData);

      const { data, error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating sales:', error);
        throw error;
      }

      if (data) {
        setSales(prev => 
          prev.map(sale => 
            sale.id === id ? data : sale
          )
        );
      }
    } catch (error) {
      console.error('Error in updateSales:', error);
      throw error;
    }
  };

  const deleteSales = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting sales:', error);
        throw error;
      }

      setSales(prev => prev.filter(sale => sale.id !== id));
    } catch (error) {
      console.error('Error in deleteSales:', error);
      throw error;
    }
  };

  const getSalesByBranch = (branchId: string) => {
    return sales.filter(sale => sale.branch_id === branchId);
  };

  return {
    sales,
    loading,
    addSales,
    updateSales,
    deleteSales,
    getSalesByBranch,
    refreshSales: fetchSales
  };
};
