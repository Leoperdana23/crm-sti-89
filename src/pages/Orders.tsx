
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useOrders, useDeleteOrder } from '@/hooks/useOrders';
import { useBranches } from '@/hooks/useBranches';
import { Order } from '@/types/order';
import OrderStatusDialog from '@/components/OrderStatusDialog';
import OrdersHeader from '@/components/Orders/OrdersHeader';
import OrdersFilters from '@/components/Orders/OrdersFilters';
import OrdersList from '@/components/Orders/OrdersList';
import OrdersLoadingState from '@/components/Orders/OrdersLoadingState';
import OrdersErrorState from '@/components/Orders/OrdersErrorState';

const Orders = () => {
  const { data: orders, isLoading, error } = useOrders();
  const { branches } = useBranches();
  const deleteMutation = useDeleteOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusDialogOpen(true);
  };

  const handleWhatsAppFollowUp = (order: Order) => {
    const message = `Halo ${order.customer_name}, pesanan Anda dengan ID #${order.id.slice(-8)} sudah siap. Silakan untuk mengambil/menunggu pengiriman pesanan Anda. Terima kasih!`;
    const phoneNumber = order.customer_phone.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('0') ? '62' + phoneNumber.slice(1) : phoneNumber;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteMutation.mutateAsync(orderId);
      setDeleteOrderId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBranchFilter('all');
  };

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesBranch = branchFilter === 'all' || 
      (order.reseller && order.reseller.branch_id === branchFilter);
    
    return matchesSearch && matchesStatus && matchesBranch;
  }) || [];

  if (isLoading) {
    return <OrdersLoadingState />;
  }

  if (error) {
    return <OrdersErrorState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrdersHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <OrdersFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          branches={branches}
        />

        <OrdersList
          filteredOrders={filteredOrders}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          branchFilter={branchFilter}
          onEditStatus={handleEditStatus}
          onWhatsAppFollowUp={handleWhatsAppFollowUp}
          onDelete={setDeleteOrderId}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Status Edit Dialog */}
      {selectedOrder && (
        <OrderStatusDialog
          isOpen={isStatusDialogOpen}
          onClose={() => {
            setIsStatusDialogOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data pesanan termasuk item-itemnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrderId && handleDeleteOrder(deleteOrderId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;
