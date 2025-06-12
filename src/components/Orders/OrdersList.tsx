
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order, OrderItem } from '@/types/order';
import OrderCard from './OrderCard';

interface OrdersListProps {
  filteredOrders: (Order & { order_items: OrderItem[] })[];
  searchTerm: string;
  statusFilter: string;
  branchFilter: string;
  onEditStatus: (order: Order) => void;
  onWhatsAppFollowUp: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onResetFilters: () => void;
}

const OrdersList = ({
  filteredOrders,
  searchTerm,
  statusFilter,
  branchFilter,
  onEditStatus,
  onWhatsAppFollowUp,
  onDelete,
  onResetFilters
}: OrdersListProps) => {
  if (filteredOrders.length > 0) {
    return (
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onEditStatus={onEditStatus}
            onWhatsAppFollowUp={onWhatsAppFollowUp}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          {searchTerm || statusFilter !== 'all' || branchFilter !== 'all'
            ? 'Pesanan tidak ditemukan' 
            : 'Belum ada pesanan'}
        </h3>
        <p className="text-gray-500 mb-4">
          {searchTerm || statusFilter !== 'all' || branchFilter !== 'all'
            ? 'Coba ubah kata kunci atau filter pencarian Anda'
            : 'Pesanan akan muncul di sini setelah pelanggan melakukan pemesanan'}
        </p>
        {(searchTerm || statusFilter !== 'all' || branchFilter !== 'all') && (
          <Button onClick={onResetFilters} variant="outline">
            Reset Filter
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersList;
