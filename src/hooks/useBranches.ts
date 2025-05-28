
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching branches:', error);
        return;
      }

      setBranches(data || []);
    } catch (error) {
      console.error('Error in fetchBranches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const addBranch = async (branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert({
          name: branchData.name,
          code: branchData.code,
          address: branchData.address,
          phone: branchData.phone,
          manager_name: branchData.manager_name,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding branch:', error);
        throw error;
      }

      if (data) {
        setBranches(prev => [...prev, data]);
        return data;
      }
    } catch (error) {
      console.error('Error in addBranch:', error);
      throw error;
    }
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .update({
          name: updates.name,
          code: updates.code,
          address: updates.address,
          phone: updates.phone,
          manager_name: updates.manager_name,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating branch:', error);
        throw error;
      }

      if (data) {
        setBranches(prev => 
          prev.map(branch => 
            branch.id === id ? data : branch
          )
        );
      }
    } catch (error) {
      console.error('Error in updateBranch:', error);
      throw error;
    }
  };

  const deleteBranch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting branch:', error);
        throw error;
      }

      setBranches(prev => prev.filter(branch => branch.id !== id));
    } catch (error) {
      console.error('Error in deleteBranch:', error);
      throw error;
    }
  };

  return {
    branches,
    loading,
    addBranch,
    updateBranch,
    deleteBranch,
    refreshBranches: fetchBranches
  };
};
