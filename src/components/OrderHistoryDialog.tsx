
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrders } from '@/hooks/useOrders';
import OrderHistoryLoading from './OrderHistory/OrderHistoryLoading';
import OrderHistoryError from './OrderHistory/OrderHistoryError';
import OrderHistoryContent from './OrderHistory/OrderHistoryContent';

interface OrderHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  catalogToken: string | null;
}

const OrderHistoryDialog = ({ isOpen, onClose, catalogToken }: OrderHistoryDialogProps) => {
  const { data: allOrders, isLoading, error } = useOrders();

  // Filter orders by catalog token and ensure order_items is always present
  const orders = allOrders?.filter(order => order.catalog_token === catalogToken)
    .map(order => ({
      ...order,
      order_items: order.order_items || []
    })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>History Pesanan</DialogTitle>
        </DialogHeader>
        
        {isLoading && <OrderHistoryLoading />}
        {error && <OrderHistoryError />}
        {!isLoading && !error && <OrderHistoryContent orders={orders} />}
      </DialogContent>
    </Dialog>
  );
};

export default OrderHistoryDialog;
