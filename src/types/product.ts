
export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  payment_terms: number;
  tax_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price: number;
  reseller_price: number | null;
  points_value: number | null;
  commission_value: number | null;
  unit: string;
  is_active: boolean;
  image_url: string | null;
  stock_quantity: number;
  min_stock_level: number;
  tags: string[] | null;
  featured: boolean;
  sort_order: number;
  barcode: string | null;
  weight: number | null;
  dimensions: string | null;
  warranty_period: number | null;
  supplier_id: string | null;
  cost_price: number | null;
  created_at: string;
  updated_at: string;
  product_categories?: {
    name: string;
  };
  suppliers?: {
    name: string;
  };
}

export interface CreateProductData {
  name: string;
  description?: string;
  category_id?: string;
  price: number;
  reseller_price?: number;
  points_value?: number;
  commission_value?: number;
  unit: string;
  image_url?: string;
  stock_quantity?: number;
  min_stock_level?: number;
  tags?: string[];
  featured?: boolean;
  sort_order?: number;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  warranty_period?: number;
  supplier_id?: string;
  cost_price?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface CreateProductCategoryData {
  name: string;
  description?: string;
}

export interface UpdateProductCategoryData extends Partial<CreateProductCategoryData> {
  id: string;
}

export interface CreateSupplierData {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: number;
  tax_number?: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  products?: {
    name: string;
  };
}
