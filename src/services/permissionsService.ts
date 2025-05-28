import { supabase } from '@/integrations/supabase/client';
import { Permission, RolePermission } from '@/types/user';
import { INITIAL_PERMISSIONS } from '@/constants/permissions';
import { createRolePermissionsData } from '@/utils/rolePermissions';

export const permissionsService = {
  async checkExistingPermissions() {
    console.log('Checking existing permissions...');
    
    // Use a simple query without any complex joins that might trigger RLS issues
    const { data: existingPermissions, error: checkError } = await supabase
      .from('permissions')
      .select('id, name, description, menu_path, created_at')
      .limit(100);

    if (checkError) {
      console.error('Error checking permissions:', checkError);
      throw new Error('Error checking permissions: ' + checkError.message);
    }

    console.log('Existing permissions check result:', existingPermissions);
    return existingPermissions;
  },

  async createInitialPermissions() {
    console.log('Creating initial permissions...');
    const { data: newPermissions, error: insertError } = await supabase
      .from('permissions')
      .insert(INITIAL_PERMISSIONS)
      .select();

    if (insertError) {
      console.error('Error creating permissions:', insertError);
      throw new Error('Error creating permissions: ' + insertError.message);
    }

    console.log('Initial permissions created:', newPermissions);
    return newPermissions || [];
  },

  async createInitialRolePermissions(permissions: Permission[]) {
    try {
      console.log('Creating initial role permissions for permissions:', permissions);
      const rolePermissionsData = createRolePermissionsData(permissions);
      console.log('Role permissions data to insert:', rolePermissionsData);

      const { error: rolePermError } = await supabase
        .from('role_permissions')
        .insert(rolePermissionsData);

      if (rolePermError) {
        console.error('Error creating role permissions:', rolePermError);
        throw new Error('Error creating role permissions: ' + rolePermError.message);
      } else {
        console.log('Initial role permissions created successfully');
      }
    } catch (error) {
      console.error('Error in createInitialRolePermissions:', error);
      throw new Error('Error creating role permissions: ' + (error as Error).message);
    }
  },

  async checkExistingRolePermissions() {
    console.log('Checking existing role permissions...');
    const { data: existingRolePerms, error } = await supabase
      .from('role_permissions')
      .select('id, role, permission_id, can_view, can_create, can_edit, can_delete')
      .limit(1);

    if (error) {
      console.error('Error checking role permissions:', error);
      throw new Error('Error checking role permissions: ' + error.message);
    }

    console.log('Existing role permissions check result:', existingRolePerms);
    return existingRolePerms;
  },

  async fetchPermissions() {
    console.log('Fetching permissions...');
    const { data, error } = await supabase
      .from('permissions')
      .select('id, name, description, menu_path, created_at')
      .order('menu_path');

    if (error) {
      console.error('Error fetching permissions:', error);
      throw new Error('Error fetching permissions: ' + error.message);
    }
    
    console.log('Permissions fetched:', data);
    return data || [];
  },

  async fetchRolePermissions() {
    console.log('Fetching role permissions...');
    
    // First get role permissions
    const { data: rolePerms, error: roleError } = await supabase
      .from('role_permissions')
      .select('id, role, permission_id, can_view, can_create, can_edit, can_delete')
      .order('role');

    if (roleError) {
      console.error('Error fetching role permissions:', roleError);
      throw new Error('Error fetching role permissions: ' + roleError.message);
    }

    // Then get permissions separately
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('id, name, description, menu_path');

    if (permError) {
      console.error('Error fetching permissions for join:', permError);
      throw new Error('Error fetching permissions: ' + permError.message);
    }

    // Manually join the data
    const joinedData = rolePerms?.map(rp => ({
      ...rp,
      permissions: permissions?.find(p => p.id === rp.permission_id) || null
    })) || [];
    
    console.log('Role permissions fetched:', joinedData);
    return joinedData;
  },

  async updateRolePermission(
    role: 'super_admin' | 'admin' | 'manager' | 'staff', 
    permissionId: string, 
    permissions: {
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
    }
  ) {
    console.log('Updating role permission:', { role, permissionId, permissions });
    
    // First check if the role permission exists
    const { data: existingRolePermission, error: checkError } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('role', role)
      .eq('permission_id', permissionId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing role permission:', checkError);
      throw checkError;
    }

    if (existingRolePermission) {
      // Update existing role permission
      const { error } = await supabase
        .from('role_permissions')
        .update(permissions)
        .eq('role', role)
        .eq('permission_id', permissionId);

      if (error) {
        console.error('Error updating role permission:', error);
        throw error;
      }
    } else {
      // Create new role permission
      console.log('Creating new role permission for', role, permissionId);
      const { error } = await supabase
        .from('role_permissions')
        .insert({
          role,
          permission_id: permissionId,
          ...permissions
        });

      if (error) {
        console.error('Error creating role permission:', error);
        throw error;
      }
    }
    
    console.log('Role permission updated/created successfully');
  }
};
