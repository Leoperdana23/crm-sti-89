
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Claim } from '@/types/employee';

export const useClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching claims:', error);
        return;
      }

      setClaims(data || []);
    } catch (error) {
      console.error('Error in fetchClaims:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const createClaim = async (claimData: Omit<Claim, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .insert(claimData)
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .single();

      if (error) {
        console.error('Error creating claim:', error);
        throw error;
      }

      if (data) {
        setClaims(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error in createClaim:', error);
      throw error;
    }
  };

  const updateClaim = async (id: string, updates: Partial<Claim>) => {
    try {
      const { data, error } = await supabase
        .from('claims')
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
        console.error('Error updating claim:', error);
        throw error;
      }

      if (data) {
        setClaims(prev => prev.map(c => c.id === id ? data : c));
      }
    } catch (error) {
      console.error('Error in updateClaim:', error);
      throw error;
    }
  };

  return {
    claims,
    loading,
    createClaim,
    updateClaim,
    refreshClaims: fetchClaims
  };
};
