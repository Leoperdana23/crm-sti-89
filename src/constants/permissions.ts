
export const INITIAL_PERMISSIONS = [
  { name: 'dashboard', description: 'Dashboard', menu_path: '/' },
  { name: 'customers', description: 'Pelanggan', menu_path: '/customers' },
  { name: 'resellers', description: 'Reseller', menu_path: '/resellers' },
  { name: 'product_catalog', description: 'Katalog Produk', menu_path: '/product-catalog' },
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
];

export const ROLES = ['super_admin', 'admin', 'manager', 'staff'] as const;
export type Role = typeof ROLES[number];
