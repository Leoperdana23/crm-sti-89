
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
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('menu_path');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async () => {
    try {
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

      if (error) throw error;
      setRolePermissions(data || []);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const updateRolePermission = async (
    role: string, 
    permissionId: string, 
    permissions: {
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
    }
  ) => {
    const { error } = await supabase
      .from('role_permissions')
      .update(permissions)
      .eq('role', role)
      .eq('permission_id', permissionId);

    if (error) throw error;
    await fetchRolePermissions();
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
