
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
          role: parsedAppUser.user_metadata?.role,
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
      setUserRole(currentUser.role);

      // If super admin, grant all permissions
      if (currentUser.role === 'super_admin') {
        const { data: allPermissions } = await supabase
          .from('permissions')
          .select('name');
        
        if (allPermissions) {
          const superAdminPermissions: UserPermissions = {};
          allPermissions.forEach(permission => {
            superAdminPermissions[permission.name] = {
              can_view: true,
              can_create: true,
              can_edit: true,
              can_delete: true
            };
          });
          setPermissions(superAdminPermissions);
        }
        return;
      }

      // Fetch role permissions for other roles
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
        .eq('role', currentUser.role);

      if (error) {
        console.error('Error fetching role permissions:', error);
        return;
      }

      const userPermissions: UserPermissions = {};
      rolePermissions?.forEach(rp => {
        if (rp.permissions && 'name' in rp.permissions) {
          userPermissions[rp.permissions.name] = {
            can_view: rp.can_view,
            can_create: rp.can_create,
            can_edit: rp.can_edit,
            can_delete: rp.can_delete
          };
        }
      });

      console.log('User permissions loaded:', userPermissions);
      setPermissions(userPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user]);

  const hasPermission = (permissionName: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view') => {
    const permission = permissions[permissionName];
    if (!permission) return false;

    switch (action) {
      case 'view': return permission.can_view;
      case 'create': return permission.can_create;
      case 'edit': return permission.can_edit;
      case 'delete': return permission.can_delete;
      default: return false;
    }
  };

  return {
    permissions,
    userRole,
    loading,
    hasPermission,
    refetch: fetchUserPermissions
  };
};
