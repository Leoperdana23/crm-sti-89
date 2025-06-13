
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { Order, ORDER_STATUS_MAPPING } from '@/types/order';

interface OrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const OrderStatusDialog = ({ isOpen, onClose, order }: OrderStatusDialogProps) => {
  const updateStatusMutation = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = React.useState(order.status);

  const handleUpdateStatus = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        status: selectedStatus,
      });
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status Pesanan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Order ID:</label>
            <p className="text-sm text-gray-600">#{order.id.slice(-8)}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer:</label>
            <p className="text-sm text-gray-600">{order.customer_name}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Saat Ini:</label>
            <p className="text-sm text-gray-600">{ORDER_STATUS_MAPPING[order.status as keyof typeof ORDER_STATUS_MAPPING] || order.status}</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status Baru:</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status baru" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="processing">Proses</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Batal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending || selectedStatus === order.status}
            >
              {updateStatusMutation.isPending ? 'Mengupdate...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusDialog;
