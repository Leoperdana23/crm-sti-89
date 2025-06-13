
export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  catalog_token: string;
  status: string;
  total_amount: number;
  notes: string | null;
  delivery_method: string;
  expedisi: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
  reseller?: {
    id: string;
    name: string;
    branch_id: string;
    branches: {
      id: string;
      name: string;
    };
  };
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
  delivery_method: string;
  expedisi?: string;
  notes?: string;
  shipping_address?: string;
}

export interface CreateOrderItemData {
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

// Updated status mapping with only 4 statuses
export const ORDER_STATUS_MAPPING = {
  pending: 'Menunggu',
  processing: 'Proses', 
  completed: 'Selesai',
  cancelled: 'Batal'
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_MAPPING;
