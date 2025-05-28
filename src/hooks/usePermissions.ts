
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Permission, RolePermission } from '@/types/user';

const INITIAL_PERMISSIONS = [
  { name: 'dashboard', description: 'Dashboard', menu_path: '/' },
  { name: 'customers', description: 'Pelanggan', menu_path: '/customers' },
  { name: 'follow_up', description: 'Follow-Up', menu_path: '/follow-up' },
  { name: 'survey', description: 'Survei', menu_path: '/survey' },
  { name: 'sales', description: 'Sales', menu_path: '/sales' },
  { name: 'branches', description: 'Cabang', menu_path: '/branches' },
  { name: 'reports', description: 'Laporan', menu_path: '/reports' },
  { name: 'users', description: 'Master User', menu_path: '/users' },
  { name: 'role_permissions', description: 'Hak Akses Role', menu_path: '/role-permissions' },
];

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializePermissions = async () => {
    try {
      console.log('Initializing permissions...');
      setError(null);
      
      // Check if permissions already exist
      const { data: existingPermissions, error: checkError } = await supabase
        .from('permissions')
        .select('*');

      if (checkError) {
        console.error('Error checking permissions:', checkError);
        setError('Error checking permissions: ' + checkError.message);
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
          setError('Error creating permissions: ' + insertError.message);
          return;
        }

        console.log('Initial permissions created:', newPermissions);
        await createInitialRolePermissions(newPermissions || []);
      } else {
        console.log('Permissions already exist:', existingPermissions);
        // Check if role permissions exist
        const { data: existingRolePerms } = await supabase
          .from('role_permissions')
          .select('*')
          .limit(1);

        if (!existingRolePerms || existingRolePerms.length === 0) {
          console.log('Creating role permissions for existing permissions...');
          await createInitialRolePermissions(existingPermissions);
        }
      }
    } catch (error) {
      console.error('Error in initializePermissions:', error);
      setError('Initialization error: ' + (error as Error).message);
    }
  };

  const createInitialRolePermissions = async (permissions: Permission[]) => {
    try {
      const roles = ['super_admin', 'admin', 'manager', 'staff'];
      const rolePermissionsData = [];

      for (const role of roles) {
        for (const permission of permissions) {
          let hasAccess = false;
          let canCreate = false;
          let canEdit = false;
          let canDelete = false;

          if (role === 'super_admin') {
            // Super admin gets full access to everything
            hasAccess = true;
            canCreate = true;
            canEdit = true;
            canDelete = true;
          } else if (role === 'admin') {
            // Admin gets access to all except role permissions management
            hasAccess = true;
            canCreate = permission.name !== 'role_permissions';
            canEdit = permission.name !== 'role_permissions';
            canDelete = permission.name !== 'role_permissions' && permission.name !== 'users';
          } else if (role === 'manager') {
            // Manager gets access to operational modules
            const managerModules = ['dashboard', 'customers', 'follow_up', 'survey', 'sales', 'reports'];
            hasAccess = managerModules.includes(permission.name);
            canCreate = hasAccess && !['reports'].includes(permission.name);
            canEdit = hasAccess && !['reports'].includes(permission.name);
            canDelete = hasAccess && ['customers', 'follow_up', 'survey', 'sales'].includes(permission.name);
          } else if (role === 'staff') {
            // Staff only gets access to dashboard, customers, follow-up, and survey
            const staffModules = ['dashboard', 'customers', 'follow_up', 'survey'];
            hasAccess = staffModules.includes(permission.name);
            canCreate = hasAccess && ['customers', 'follow_up', 'survey'].includes(permission.name);
            canEdit = hasAccess && ['customers', 'follow_up', 'survey'].includes(permission.name);
            canDelete = false; // Staff cannot delete anything
          }

          rolePermissionsData.push({
            role: role as 'super_admin' | 'admin' | 'manager' | 'staff',
            permission_id: permission.id,
            can_view: hasAccess,
            can_create: canCreate,
            can_edit: canEdit,
            can_delete: canDelete
          });
        }
      }

      const { error: rolePermError } = await supabase
        .from('role_permissions')
        .insert(rolePermissionsData);

      if (rolePermError) {
        console.error('Error creating role permissions:', rolePermError);
        setError('Error creating role permissions: ' + rolePermError.message);
      } else {
        console.log('Initial role permissions created successfully');
      }
    } catch (error) {
      console.error('Error in createInitialRolePermissions:', error);
      setError('Error creating role permissions: ' + (error as Error).message);
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
        setError('Error fetching permissions: ' + error.message);
        return;
      }
      
      console.log('Permissions fetched:', data);
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Error fetching permissions: ' + (error as Error).message);
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
        setError('Error fetching role permissions: ' + error.message);
        return;
      }
      
      console.log('Role permissions fetched:', data);
      setRolePermissions(data || []);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setError('Error fetching role permissions: ' + (error as Error).message);
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
      setError(null);
      
      try {
        await initializePermissions();
        await fetchPermissions();
        await fetchRolePermissions();
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to initialize permissions data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    permissions,
    rolePermissions,
    loading,
    error,
    updateRolePermission,
    refetch: async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchPermissions();
        await fetchRolePermissions();
      } catch (error) {
        console.error('Error refetching data:', error);
        setError('Failed to refresh permissions data');
      } finally {
        setLoading(false);
      }
    }
  };
};
