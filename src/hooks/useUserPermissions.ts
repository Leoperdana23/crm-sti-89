
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
      'customer_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'reseller_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'product_management': { can_view: true, can_create: false, can_edit: false, can_delete: false },
      'followup_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'work_process_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'survey_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'deal_history_view': { can_view: true, can_create: false, can_edit: false, can_delete: false },
      'order_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
    };

    if (role === 'super_admin') {
      return {
        'dashboard': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'customer_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'reseller_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'product_management': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'followup_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'work_process_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'survey_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'deal_history_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'order_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'sales_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'branch_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'reports_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'user_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'role_permission_view': { can_view: true, can_create: true, can_edit: true, can_delete: true }
      };
    } else if (role === 'admin') {
      return {
        ...staffPermissions,
        'product_management': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'sales_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'branch_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'reports_view': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'user_view': { can_view: true, can_create: true, can_edit: true, can_delete: false }
      };
    } else if (role === 'manager') {
      return {
        ...staffPermissions,
        'product_management': { can_view: true, can_create: false, can_edit: false, can_delete: false },
        'branch_view': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'reports_view': { can_view: true, can_create: true, can_edit: true, can_delete: true }
      };
    }

    // Default for staff
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
        try {
          const { data: appUserData, error: appUserError } = await supabase
            .from('app_users')
            .select('role')
            .eq('email', currentUser.email)
            .maybeSingle();

          if (appUserError) {
            console.log('Error fetching app user, using default role:', appUserError.message);
          } else if (appUserData) {
            actualRole = appUserData.role;
            console.log('Found role from app_users:', actualRole);
          } else {
            console.log('No app user found, using default role:', actualRole);
          }
        } catch (error) {
          console.log('Error querying app_users, using default role:', error);
        }
      }

      setUserRole(actualRole);

      // Get default permissions based on role
      const defaultPermissions = getDefaultPermissions(actualRole);
      console.log('Setting default permissions for role:', actualRole, defaultPermissions);

      // For now, just use default permissions since database doesn't have permissions configured
      setPermissions(defaultPermissions);
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
