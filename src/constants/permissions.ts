
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
