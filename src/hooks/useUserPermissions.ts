
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPermissions {
  [key: string]: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
}

export const useUserPermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = () => {
    // Check for app user first
    const appUser = localStorage.getItem('appUser');
    if (appUser) {
      try {
        const parsedAppUser = JSON.parse(appUser);
        return {
          email: parsedAppUser.user_metadata?.email || parsedAppUser.email,
          role: parsedAppUser.user_metadata?.role || parsedAppUser.role || 'super_admin',
          type: 'app'
        };
      } catch (error) {
        console.error('Error parsing app user:', error);
      }
    }

    // Check for sales user
    const salesUser = localStorage.getItem('salesUser');
    if (salesUser) {
      try {
        const parsedSalesUser = JSON.parse(salesUser);
        return {
          email: parsedSalesUser.user_metadata?.email || parsedSalesUser.email,
          role: 'staff',
          type: 'sales'
        };
      } catch (error) {
        console.error('Error parsing sales user:', error);
      }
    }

    // Regular auth user - give super_admin by default for testing
    if (user) {
      return {
        email: user.email,
        role: 'super_admin',
        type: 'auth'
      };
    }

    return {
      email: 'guest@example.com',
      role: 'super_admin',
      type: 'guest'
    };
  };

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      console.log('Current user detected:', currentUser);

      if (!currentUser) {
        console.log('No user found, setting empty permissions');
        setPermissions({});
        setUserRole(null);
        return;
      }

      const actualRole = currentUser.role || 'super_admin';
      console.log('Setting role:', actualRole);
      setUserRole(actualRole);

      // Fetch permissions from database
      const { data: rolePermissions, error } = await supabase
        .from('role_permissions')
        .select(`
          can_view,
          can_create,
          can_edit,
          can_delete,
          permissions!inner (
            name
          )
        `)
        .eq('role', actualRole);

      if (error) {
        console.error('Error fetching permissions:', error);
        setPermissions({});
        return;
      }

      // Transform the data into the expected format
      const permissionsMap: UserPermissions = {};
      rolePermissions?.forEach((rolePermission: any) => {
        const permissionName = rolePermission.permissions.name;
        permissionsMap[permissionName] = {
          can_view: rolePermission.can_view,
          can_create: rolePermission.can_create,
          can_edit: rolePermission.can_edit,
          can_delete: rolePermission.can_delete
        };
      });

      console.log('Permissions loaded from database:', permissionsMap);
      setPermissions(permissionsMap);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setPermissions({});
      setUserRole('super_admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user]);

  const hasPermission = (permissionName: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view') => {
    console.log(`Permission check: ${permissionName} (${action})`);
    
    const currentUser = getCurrentUser();
    
    // Super admin always has access
    if (currentUser?.role === 'super_admin') {
      console.log('Super admin - access granted');
      return true;
    }

    const permission = permissions[permissionName];
    if (!permission) {
      console.log(`No permission found for: ${permissionName}`);
      return false;
    }

    const hasAccess = (() => {
      switch (action) {
        case 'view': return permission.can_view;
        case 'create': return permission.can_create;
        case 'edit': return permission.can_edit;
        case 'delete': return permission.can_delete;
        default: return false;
      }
    })();

    console.log(`Permission result: ${permissionName} (${action}) = ${hasAccess}`);
    return hasAccess;
  };

  return {
    permissions,
    userRole,
    loading,
    hasPermission,
    refetch: fetchUserPermissions
  };
};
