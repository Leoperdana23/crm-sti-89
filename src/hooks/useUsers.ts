
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppUser } from '@/types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
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

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Users fetched:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<AppUser, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Adding user:', userData);
      
      // Pastikan branch_id diset ke null jika kosong
      const cleanUserData = {
        ...userData,
        branch_id: userData.branch_id === '' || userData.branch_id === 'none' ? null : userData.branch_id
      };
      
      const { data, error } = await supabase
        .from('app_users')
        .insert([cleanUserData])
        .select(`
          *,
          branches (
            id,
            name
          )
        `)
        .single();

      if (error) {
        console.error('Error adding user:', error);
        throw error;
      }
      
      console.log('User added successfully:', data);
      await fetchUsers();
      return data;
    } catch (error) {
      console.error('Error in addUser:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<AppUser>) => {
    try {
      console.log('Updating user:', { id, userData });
      
      // Pastikan branch_id diset ke null jika kosong
      const cleanUserData = {
        ...userData,
        branch_id: userData.branch_id === '' || userData.branch_id === 'none' ? null : userData.branch_id
      };
      
      const { data, error } = await supabase
        .from('app_users')
        .update(cleanUserData)
        .eq('id', id)
        .select(`
          *,
          branches (
            id,
            name
          )
        `)
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      console.log('User updated successfully:', data);
      await fetchUsers();
      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      console.log('Deleting user:', id);
      const { error } = await supabase
        .from('app_users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
      
      console.log('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
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
