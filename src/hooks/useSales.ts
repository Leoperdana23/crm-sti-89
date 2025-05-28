
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

      const transformedSales: Sales[] = (data || []).map(sale => ({
        ...sale,
        branchId: sale.branch_id,
        isActive: sale.is_active,
        createdAt: sale.created_at,
        updatedAt: sale.updated_at,
      }));

      setSales(transformedSales);
    } catch (error) {
      console.error('Error in fetchSales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const addSales = async (salesData: Omit<Sales, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          name: salesData.name,
          code: salesData.code,
          phone: salesData.phone,
          email: salesData.email,
          branch_id: salesData.branchId,
          is_active: salesData.isActive
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding sales:', error);
        throw error;
      }

      if (data) {
        const newSales: Sales = {
          ...data,
          branchId: data.branch_id,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        
        setSales(prev => [newSales, ...prev]);
        return newSales;
      }
    } catch (error) {
      console.error('Error in addSales:', error);
      throw error;
    }
  };

  const updateSales = async (id: string, updates: Partial<Sales>) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .update({
          name: updates.name,
          code: updates.code,
          phone: updates.phone,
          email: updates.email,
          branch_id: updates.branchId,
          is_active: updates.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating sales:', error);
        throw error;
      }

      if (data) {
        const updatedSales: Sales = {
          ...data,
          branchId: data.branch_id,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setSales(prev => 
          prev.map(sale => 
            sale.id === id ? updatedSales : sale
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
    return sales.filter(sale => sale.branchId === branchId);
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
