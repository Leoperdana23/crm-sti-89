
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Edit } from 'lucide-react';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { Order } from '@/types/order';

interface OrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const OrderStatusDialog = ({ isOpen, onClose, order }: OrderStatusDialogProps) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const updateStatusMutation = useUpdateOrderStatus();

  const statusOptions = [
    { value: 'pending', label: 'Menunggu' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'processing', label: 'Diproses' },
    { value: 'ready', label: 'Siap' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newStatus === order.status) {
      onClose();
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        status: newStatus
      });
      onClose();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Status Pesanan
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Pesanan ID: <span className="font-mono">#{order.id.slice(-8)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Pelanggan: <span className="font-medium">{order.customer_name}</span>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Status Pesanan</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={updateStatusMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateStatusMutation.isPending || newStatus === order.status}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memperbarui...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusDialog;
