
export const getRoleLabel = (role: string) => {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'admin': return 'Admin';
    case 'manager': return 'Manager';
    case 'staff': return 'Staff';
    default: return role;
  }
};

export const getPermissionTypeLabel = (type: string) => {
  switch (type) {
    case 'can_view': return 'Lihat';
    case 'can_create': return 'Buat';
    case 'can_edit': return 'Edit';
    case 'can_delete': return 'Hapus';
    default: return type;
  }
};
