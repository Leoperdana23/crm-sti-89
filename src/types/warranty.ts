
export interface WarrantySupplier {
  id: string;
  name: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  product_types?: string[];
  default_warranty_months: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarrantyProduct {
  id: string;
  product_name: string;
  serial_number: string;
  supplier_id?: string;
  received_date: string;
  supplier_invoice_date?: string;
  warranty_months: number;
  warranty_start_date: string;
  warranty_end_date: string;
  status: 'in_stock' | 'sold' | 'damaged' | 'returned';
  notes?: string;
  created_at: string;
  updated_at: string;
  supplier?: WarrantySupplier;
}

export interface WarrantySale {
  id: string;
  warranty_product_id: string;
  sale_date: string;
  customer_id?: string;
  reseller_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_warranty_start_date: string;
  customer_warranty_end_date: string;
  sale_price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  warranty_product?: WarrantyProduct;
  customer?: any;
  reseller?: any;
}

export interface WarrantyClaim {
  id: string;
  warranty_sale_id: string;
  claim_date: string;
  problem_description: string;
  status: 'processing' | 'completed' | 'rejected';
  resolution_notes?: string;
  technician_notes?: string;
  replacement_serial_number?: string;
  completed_date?: string;
  created_by?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  warranty_sale?: WarrantySale;
}

export interface WarrantyNotification {
  id: string;
  warranty_sale_id: string;
  notification_type: 'expiring_soon' | 'expired';
  notification_date: string;
  days_until_expiry?: number;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
  warranty_sale?: WarrantySale;
}
