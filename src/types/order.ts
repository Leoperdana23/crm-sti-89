
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  points_earned: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  catalog_token: string;
  status: string;
  total_amount: number;
  notes?: string;
  delivery_method: string;
  expedisi?: string;
  shipping_address?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  reseller?: {
    id: string;
    name: string;
    phone: string;
    branch_id?: string;
  };
}

export const ORDER_STATUS_MAPPING = {
  pending: 'Menunggu',
  processing: 'Proses',
  completed: 'Selesai',
  cancelled: 'Batal'
} as const;
