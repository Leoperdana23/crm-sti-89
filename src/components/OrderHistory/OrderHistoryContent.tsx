
import React from 'react';
import { Package } from 'lucide-react';
import { Order, OrderItem } from '@/types/order';
import OrderCard from './OrderCard';

interface OrderHistoryContentProps {
  orders: (Order & { order_items: OrderItem[] })[] | undefined;
}

const OrderHistoryContent = ({ orders }: OrderHistoryContentProps) => {
  if (orders && orders.length > 0) {
    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">Belum Ada Pesanan</h3>
      <p className="text-gray-500">Anda belum memiliki history pesanan</p>
    </div>
  );
};

export default OrderHistoryContent;
