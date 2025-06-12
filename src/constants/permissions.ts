
export const PERMISSIONS = {
  // Dashboard
  dashboard: 'dashboard',
  
  // Order Management
  orders: 'orders',
  
  // Customer Management
  customers: 'customers',
  
  // Reseller Management
  resellers: 'resellers',
  
  // Follow Up Management
  follow_up: 'follow_up',
  
  // Birthday (no permission required)
  birthday: 'birthday',
  
  // Work Process Management
  work_process: 'work_process',
  
  // Survey Management
  survey: 'survey',
  
  // Product Management
  product_catalog: 'product_catalog',
  
  // Deal History Management
  deal_history: 'deal_history',
  
  // Sales Management
  sales: 'sales',
  
  // Branch Management
  branches: 'branches',
  
  // Reports
  reports: 'reports',
  
  // User Management
  users: 'users',
  
  // Role and Permission Management
  role_permissions: 'role_permissions',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Updated initial permissions to match database structure
export const INITIAL_PERMISSIONS = [
  { name: 'dashboard', description: 'Dashboard', menu_path: '/dashboard' },
  { name: 'orders', description: 'Daftar Pesanan', menu_path: '/orders' },
  { name: 'customers', description: 'Pelanggan', menu_path: '/customers' },
  { name: 'resellers', description: 'Reseller', menu_path: '/resellers' },
  { name: 'follow_up', description: 'Follow-Up', menu_path: '/follow-up' },
  { name: 'birthday', description: 'Ulang Tahun', menu_path: '/birthday' },
  { name: 'work_process', description: 'Proses Pekerjaan', menu_path: '/work-process' },
  { name: 'survey', description: 'Survei', menu_path: '/survey' },
  { name: 'product_catalog', description: 'Katalog Produk', menu_path: '/catalog' },
  { name: 'deal_history', description: 'Riwayat Deal', menu_path: '/deal-history' },
  { name: 'sales', description: 'Sales', menu_path: '/sales' },
  { name: 'branches', description: 'Cabang', menu_path: '/branches' },
  { name: 'reports', description: 'Laporan', menu_path: '/reports' },
  { name: 'users', description: 'Master User', menu_path: '/users' },
  { name: 'role_permissions', description: 'Hak Akses Role', menu_path: '/role-permissions' },
];

export const ROLES = ['super_admin', 'admin', 'manager', 'staff'] as const;
export type Role = typeof ROLES[number];
