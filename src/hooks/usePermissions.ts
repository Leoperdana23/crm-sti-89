
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Permission, RolePermission } from '@/types/user';

const INITIAL_PERMISSIONS = [
  { name: 'dashboard', description: 'Dashboard', menu_path: '/' },
  { name: 'customers', description: 'Pelanggan', menu_path: '/customers' },
  { name: 'follow_up', description: 'Follow-Up', menu_path: '/follow-up' },
  { name: 'survey', description: 'Survei', menu_path: '/survey' },
  { name: 'branches', description: 'Cabang', menu_path: '/branches' },
  { name: 'reports', description: 'Laporan', menu_path: '/reports' },
  { name: 'users', description: 'Master User', menu_path: '/users' },
  { name: 'role_permissions', description: 'Hak Akses Role', menu_path: '/role-permissions' },
];

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);

  const initializePermissions = async () => {
    try {
      console.log('Initializing permissions...');
      
      // Check if permissions already exist
      const { data: existingPermissions, error: checkError } = await supabase
        .from('permissions')
        .select('*');

      if (checkError) {
        console.error('Error checking permissions:', checkError);
        return;
      }

      // If no permissions exist, create initial ones
      if (!existingPermissions || existingPermissions.length === 0) {
        console.log('Creating initial permissions...');
        const { data: newPermissions, error: insertError } = await supabase
          .from('permissions')
          .insert(INITIAL_PERMISSIONS)
          .select();

        if (insertError) {
          console.error('Error creating permissions:', insertError);
          return;
        }

        console.log('Initial permissions created:', newPermissions);
        
        // Create initial role permissions for all roles
        if (newPermissions) {
          const roles = ['super_admin', 'admin', 'manager', 'staff'];
          const rolePermissionsData = [];

          for (const role of roles) {
            for (const permission of newPermissions) {
              // Super admin gets all permissions
              const hasFullAccess = role === 'super_admin';
              // Admin gets most permissions except role management
              const isAdmin = role === 'admin' && permission.name !== 'role_permissions';
              // Manager gets view and create permissions for most modules
              const isManager = role === 'manager' && !['users', 'role_permissions'].includes(permission.name);
              // Staff gets basic view permissions
              const isStaff = role === 'staff' && ['dashboard', 'customers', 'follow_up', 'survey'].includes(permission.name);

              rolePermissionsData.push({
                role: role as 'super_admin' | 'admin' | 'manager' | 'staff',
                permission_id: permission.id,
                can_view: hasFullAccess || isAdmin || isManager || isStaff,
                can_create: hasFullAccess || isAdmin || (isManager && !['reports'].includes(permission.name)),
                can_edit: hasFullAccess || isAdmin || (isManager && !['reports'].includes(permission.name)),
                can_delete: hasFullAccess || (isAdmin && !['role_permissions'].includes(permission.name))
              });
            }
          }

          const { error: rolePermError } = await supabase
            .from('role_permissions')
            .insert(rolePermissionsData);

          if (rolePermError) {
            console.error('Error creating role permissions:', rolePermError);
          } else {
            console.log('Initial role permissions created');
          }
        }
      }
    } catch (error) {
      console.error('Error in initializePermissions:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
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
    const initializeData = async () => {
      setLoading(true);
      await initializePermissions();
      await fetchPermissions();
      await fetchRolePermissions();
      setLoading(false);
    };

    initializeData();
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
