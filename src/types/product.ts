
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
  unit: string;
  is_active: boolean;
  image_url: string | null;
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
  unit: string;
  image_url?: string;
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
