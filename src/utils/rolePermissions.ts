
import { Permission } from '@/types/user';
import { Role } from '@/constants/permissions';

export const createRolePermissionsData = (permissions: Permission[]) => {
  const roles: Role[] = ['super_admin', 'admin', 'manager', 'staff'];
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
        // Manager gets access to operational menus but not user/role management
        const managerRestrictedModules = ['users', 'role_permissions'];
        hasAccess = !managerRestrictedModules.includes(permission.name);
        canCreate = hasAccess;
        canEdit = hasAccess;
        canDelete = hasAccess && !['sales', 'branches'].includes(permission.name);
      } else if (role === 'staff') {
        // Staff gets access to basic operational menus
        const staffAllowedModules = [
          'dashboard', 
          'orders', 
          'customers', 
          'resellers', 
          'follow_up', 
          'birthday', 
          'work_process', 
          'survey', 
          'product_catalog'
        ];
        hasAccess = staffAllowedModules.includes(permission.name);
        canCreate = hasAccess && ['orders', 'customers', 'resellers', 'follow_up', 'work_process', 'survey'].includes(permission.name);
        canEdit = hasAccess && ['orders', 'customers', 'resellers', 'follow_up', 'work_process', 'survey'].includes(permission.name);
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

  return rolePermissionsData;
};
