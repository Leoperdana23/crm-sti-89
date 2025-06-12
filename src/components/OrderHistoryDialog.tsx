
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import OrderHistoryLoading from './OrderHistory/OrderHistoryLoading';
import OrderHistoryError from './OrderHistory/OrderHistoryError';
import OrderHistoryContent from './OrderHistory/OrderHistoryContent';

interface OrderHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  catalogToken: string | null;
}

const OrderHistoryDialog = ({ isOpen, onClose, catalogToken }: OrderHistoryDialogProps) => {
  const { data: orders, isLoading, error } = useResellerOrders(catalogToken);

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
