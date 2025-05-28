
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_users')
        .select(`
          *,
          branches (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<AppUser, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('app_users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    await fetchUsers();
    return data;
  };

  const updateUser = async (id: string, userData: Partial<AppUser>) => {
    const { data, error } = await supabase
      .from('app_users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchUsers();
    return data;
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
};
