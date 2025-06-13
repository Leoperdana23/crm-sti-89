
export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
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
  unit: string;
  is_active: boolean;
  image_url: string | null;
  stock_quantity: number;
  min_stock_level: number;
  tags: string[] | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_categories?: {
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
  unit: string;
  image_url?: string;
  stock_quantity?: number;
  min_stock_level?: number;
  tags?: string[];
  featured?: boolean;
  sort_order?: number;
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
