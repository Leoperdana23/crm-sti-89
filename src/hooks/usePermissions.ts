
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Permission, RolePermission } from '@/types/user';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching permissions...');
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu_path');

      if (error) {
        console.error('Error fetching permissions:', error);
        throw error;
      }
      
      console.log('Permissions fetched:', data);
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      console.log('Fetching role permissions...');
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permissions (
            id,
            name,
            description,
            menu_path
          )
        `)
        .order('role');

      if (error) {
        console.error('Error fetching role permissions:', error);
        throw error;
      }
      
      console.log('Role permissions fetched:', data);
      setRolePermissions(data || []);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setRolePermissions([]);
    }
  };

  const updateRolePermission = async (
    role: 'super_admin' | 'admin' | 'manager' | 'staff', 
    permissionId: string, 
    permissions: {
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
    }
  ) => {
    try {
      console.log('Updating role permission:', { role, permissionId, permissions });
      const { error } = await supabase
        .from('role_permissions')
        .update(permissions)
        .eq('role', role)
        .eq('permission_id', permissionId);

      if (error) {
        console.error('Error updating role permission:', error);
        throw error;
      }
      
      console.log('Role permission updated successfully');
      await fetchRolePermissions();
    } catch (error) {
      console.error('Error in updateRolePermission:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchRolePermissions();
  }, []);

  return {
    permissions,
    rolePermissions,
    loading,
    updateRolePermission,
    refetch: () => {
      fetchPermissions();
      fetchRolePermissions();
    }
  };
};
