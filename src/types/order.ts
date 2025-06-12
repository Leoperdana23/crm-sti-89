
export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  catalog_token: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface CreateOrderData {
  customer_name: string;
  customer_phone: string;
  catalog_token: string;
  total_amount: number;
  notes?: string;
}

export interface CreateOrderItemData {
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}
