
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  reseller_price?: number;
  cost_price?: number;
  category_id?: string;
  supplier_id?: string;
  image_url?: string;
  is_active: boolean;
  stock_quantity?: number;
  min_stock_level?: number;
  unit: string;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  featured?: boolean;
  sort_order?: number;
  points_value?: number;
  commission_value?: number;
  warranty_period?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
  product_categories?: {
    id: string;
    name: string;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  reseller_price?: number;
  cost_price?: number;
  category_id?: string;
  supplier_id?: string;
  image_url?: string;
  stock_quantity?: number;
  min_stock_level?: number;
  unit?: string;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  featured?: boolean;
  sort_order?: number;
  points_value?: number;
  commission_value?: number;
  warranty_period?: number;
  tags?: string[];
  is_active?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}
