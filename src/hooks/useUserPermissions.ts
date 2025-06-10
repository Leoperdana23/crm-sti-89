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
          role: parsedAppUser.user_metadata?.role || parsedAppUser.role,
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
          role: 'staff', // Sales users are treated as staff
          type: 'sales'
        };
      } catch (error) {
        console.error('Error parsing sales user:', error);
      }
    }

    // Regular auth user
    if (user) {
      return {
        email: user.email,
        role: user.user_metadata?.role || 'staff',
        type: 'auth'
      };
    }

    return null;
  };

  const getDefaultPermissions = (role: string): UserPermissions => {
    // Staff permissions - only the specified menus
    const staffPermissions = {
      'dashboard': { can_view: true, can_create: false, can_edit: false, can_delete: false },
      'customers': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'resellers': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'follow_up': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'work_process': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'survey': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'deal_history': { can_view: true, can_create: false, can_edit: false, can_delete: false },
      'birthday': { can_view: true, can_create: false, can_edit: false, can_delete: false },
    };

    if (role === 'super_admin') {
      return {
        ...staffPermissions,
        'dashboard': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'customers': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'resellers': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'follow_up': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'work_process': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'survey': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'deal_history': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'birthday': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'sales': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'branches': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'reports': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'users': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'role_permissions': { can_view: true, can_create: true, can_edit: true, can_delete: true }
      };
    } else if (role === 'admin') {
      return {
        ...staffPermissions,
        'sales': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'branches': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'reports': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'users': { can_view: true, can_create: true, can_edit: true, can_delete: false }
      };
    } else if (role === 'manager') {
      return {
        ...staffPermissions,
        'branches': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'reports': { can_view: true, can_create: true, can_edit: true, can_delete: true }
      };
    }

    // Default for staff - only the specified menus
    return staffPermissions;
  };

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        setPermissions({});
        setUserRole(null);
        return;
      }

      console.log('Fetching permissions for user:', currentUser);

      // First, get the user's role from app_users table if it's an app user
      let actualRole = currentUser.role;
      
      if (currentUser.type === 'app' || currentUser.type === 'auth') {
        const { data: appUserData, error: appUserError } = await supabase
          .from('app_users')
          .select('role')
          .eq('email', currentUser.email)
          .single();

        if (appUserError) {
          console.log('No app user found, using default role:', actualRole);
        } else if (appUserData) {
          actualRole = appUserData.role;
          console.log('Found role from app_users:', actualRole);
        }
      }

      setUserRole(actualRole);

      // Get default permissions based on role
      const defaultPermissions = getDefaultPermissions(actualRole);
      console.log('Setting default permissions for role:', actualRole, defaultPermissions);

      // Try to fetch role permissions from database
      const { data: rolePermissions, error } = await supabase
        .from('role_permissions')
        .select(`
          can_view,
          can_create,
          can_edit,
          can_delete,
          permissions:permission_id (
            name
          )
        `)
        .eq('role', actualRole);

      if (error) {
        console.log('Using default permissions due to error:', error);
        setPermissions(defaultPermissions);
        return;
      }

      console.log('Role permissions from database:', rolePermissions);

      // If database has permissions, merge them with defaults
      if (rolePermissions && rolePermissions.length > 0) {
        const dbPermissions: UserPermissions = {};
        rolePermissions.forEach(rp => {
          if (rp.permissions && 'name' in rp.permissions) {
            dbPermissions[rp.permissions.name] = {
              can_view: rp.can_view,
              can_create: rp.can_create,
              can_edit: rp.can_edit,
              can_delete: rp.can_delete
            };
          }
        });
        
        // Merge database permissions with defaults (defaults as fallback)
        const finalPermissions = { ...defaultPermissions, ...dbPermissions };
        console.log('Using merged permissions:', finalPermissions);
        setPermissions(finalPermissions);
      } else {
        console.log('No database permissions found, using defaults:', defaultPermissions);
        setPermissions(defaultPermissions);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      // Set basic permissions for staff as fallback
      const fallbackPermissions = getDefaultPermissions('staff');
      setPermissions(fallbackPermissions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user]);

  const hasPermission = (permissionName: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view') => {
    // Super admin always has all permissions
    const currentUser = getCurrentUser();
    if (currentUser?.role === 'super_admin') {
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

    console.log(`Permission check: ${permissionName} (${action}) = ${hasAccess}`);
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
