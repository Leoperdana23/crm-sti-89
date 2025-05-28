
export const INITIAL_PERMISSIONS = [
  { name: 'dashboard', description: 'Dashboard', menu_path: '/' },
  { name: 'customers', description: 'Pelanggan', menu_path: '/customers' },
  { name: 'follow_up', description: 'Follow-Up', menu_path: '/follow-up' },
  { name: 'work_process', description: 'Proses Pekerjaan', menu_path: '/work-process' },
  { name: 'survey', description: 'Survei', menu_path: '/survey' },
  { name: 'sales', description: 'Sales', menu_path: '/sales' },
  { name: 'branches', description: 'Cabang', menu_path: '/branches' },
  { name: 'reports', description: 'Laporan', menu_path: '/reports' },
  { name: 'users', description: 'Master User', menu_path: '/users' },
  { name: 'role_permissions', description: 'Hak Akses Role', menu_path: '/role-permissions' },
];

export const ROLES = ['super_admin', 'admin', 'manager', 'staff'] as const;
export type Role = typeof ROLES[number];
