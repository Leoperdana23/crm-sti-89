
export const PERMISSIONS = {
  // Customer Management
  customer_view: 'customer_view',
  customer_create: 'customer_create',
  customer_edit: 'customer_edit',
  customer_delete: 'customer_delete',
  
  // Follow Up Management
  followup_view: 'followup_view',
  followup_create: 'followup_create',
  followup_edit: 'followup_edit',
  followup_delete: 'followup_delete',
  
  // Survey Management
  survey_view: 'survey_view',
  survey_create: 'survey_create',
  survey_edit: 'survey_edit',
  survey_delete: 'survey_delete',
  
  // Work Process Management
  work_process_view: 'work_process_view',
  work_process_create: 'work_process_create',
  work_process_edit: 'work_process_edit',
  work_process_delete: 'work_process_delete',
  
  // Deal History Management
  deal_history_view: 'deal_history_view',
  deal_history_create: 'deal_history_create',
  deal_history_edit: 'deal_history_edit',
  deal_history_delete: 'deal_history_delete',
  
  // Sales Management
  sales_view: 'sales_view',
  sales_create: 'sales_create',
  sales_edit: 'sales_edit',
  sales_delete: 'sales_delete',
  
  // Branch Management
  branch_view: 'branch_view',
  branch_create: 'branch_create',
  branch_edit: 'branch_edit',
  branch_delete: 'branch_delete',
  
  // Reseller Management
  reseller_view: 'reseller_view',
  reseller_create: 'reseller_create',
  reseller_edit: 'reseller_edit',
  reseller_delete: 'reseller_delete',
  
  // Product Management
  product_management: 'product_management',
  
  // Order Management
  order_view: 'order_view',
  order_create: 'order_create',
  order_edit: 'order_edit',
  order_delete: 'order_delete',
  
  // User Management
  user_view: 'user_view',
  user_create: 'user_create',
  user_edit: 'user_edit',
  user_delete: 'user_delete',
  
  // Role and Permission Management
  role_permission_view: 'role_permission_view',
  role_permission_edit: 'role_permission_edit',
  
  // Reports
  reports_view: 'reports_view',
  
  // Attendance Management
  attendance_view: 'attendance_view',
  attendance_create: 'attendance_create',
  attendance_edit: 'attendance_edit',
  attendance_delete: 'attendance_delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Add the missing exports for compatibility
export const INITIAL_PERMISSIONS = [
  { name: 'dashboard', description: 'Dashboard', menu_path: '/' },
  { name: 'customers', description: 'Pelanggan', menu_path: '/customers' },
  { name: 'resellers', description: 'Reseller', menu_path: '/resellers' },
  { name: 'product_catalog', description: 'Katalog Produk', menu_path: '/product-catalog' },
  { name: 'orders', description: 'Daftar Pesanan', menu_path: '/orders' },
  { name: 'product_management', description: 'Kelola Produk', menu_path: '/product-catalog' },
  { name: 'product_create', description: 'Tambah Produk', menu_path: '/product-catalog' },
  { name: 'product_edit', description: 'Edit Produk', menu_path: '/product-catalog' },
  { name: 'product_delete', description: 'Hapus Produk', menu_path: '/product-catalog' },
  { name: 'follow_up', description: 'Follow-Up', menu_path: '/follow-up' },
  { name: 'work_process', description: 'Proses Pekerjaan', menu_path: '/work-process' },
  { name: 'survey', description: 'Survei', menu_path: '/survey' },
  { name: 'deal_history', description: 'Riwayat Deal', menu_path: '/deal-history' },
  { name: 'birthday', description: 'Ulang Tahun', menu_path: '/birthday' },
  { name: 'sales', description: 'Sales', menu_path: '/sales' },
  { name: 'branches', description: 'Cabang', menu_path: '/branches' },
  { name: 'reports', description: 'Laporan', menu_path: '/reports' },
  { name: 'users', description: 'Master User', menu_path: '/users' },
  { name: 'role_permissions', description: 'Hak Akses Role', menu_path: '/role-permissions' },
  { name: 'attendance', description: 'Absensi', menu_path: '/attendance' },
];

export const ROLES = ['super_admin', 'admin', 'manager', 'staff'] as const;
export type Role = typeof ROLES[number];
