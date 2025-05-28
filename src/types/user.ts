
export interface AppUser {
  id: string;
  auth_user_id?: string;
  username: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  branch_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  menu_path: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  permission_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  permission?: Permission;
}
