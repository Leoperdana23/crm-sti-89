
export interface ResellerSession {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  commission_rate: number;
  total_points: number;
  token: string;
  expires_at: string;
}

export interface ResellerStats {
  total_orders: number;
  total_commission: number;
  current_month_orders: number;
  current_month_commission: number;
}

export interface ResellerOrder {
  id: string;
  order_id: string;
  commission_rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  order?: {
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    status: string;
    order_items: Array<{
      product_name: string;
      quantity: number;
      product_price: number;
      subtotal: number;
    }>;
  };
}
