import React, { useState } from 'react';
import { Search, Package, Phone, User, Calendar, Edit, MessageCircle, Filter, MapPin, Truck, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useOrders, useDeleteOrder } from '@/hooks/useOrders';
import { useBranches } from '@/hooks/useBranches';
import { Order, OrderItem } from '@/types/order';
import OrderStatusDialog from '@/components/OrderStatusDialog';

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      confirmed: { label: 'Dikonfirmasi', variant: 'default' as const },
      processing: { label: 'Diproses', variant: 'default' as const },
      ready: { label: 'Siap', variant: 'default' as const },
      completed: { label: 'Selesai', variant: 'default' as const },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

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

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // For branch filter, we need to check if the order's catalog_token belongs to a reseller from the selected branch
    const matchesBranch = branchFilter === 'all' || 
      (order.reseller && order.reseller.branch_id === branchFilter);
    
    return matchesSearch && matchesStatus && matchesBranch;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          <span className="text-gray-700">Memuat daftar pesanan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat</h3>
            <p className="text-gray-600">Terjadi kesalahan saat memuat daftar pesanan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daftar Pesanan</h1>
              <p className="text-gray-600 mt-1">Kelola semua pesanan dari katalog publik</p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan nama, telepon, atau ID pesanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Semua Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="ready">Siap</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onEditStatus={handleEditStatus}
                onWhatsAppFollowUp={handleWhatsAppFollowUp}
                onDelete={setDeleteOrderId}
              />
            ))}
          </div>
        ) : (
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
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setBranchFilter('all');
                  }}
                  variant="outline"
                >
                  Reset Filter
                </Button>
              )}
            </CardContent>
          </Card>
        )}
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

interface OrderCardProps {
  order: Order & { order_items: OrderItem[] };
  onEditStatus: (order: Order) => void;
  onWhatsAppFollowUp: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

const OrderCard = ({ order, onEditStatus, onWhatsAppFollowUp, onDelete }: OrderCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      confirmed: { label: 'Dikonfirmasi', variant: 'default' as const },
      processing: { label: 'Diproses', variant: 'default' as const },
      ready: { label: 'Siap', variant: 'default' as const },
      completed: { label: 'Selesai', variant: 'default' as const },
      cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getDeliveryIcon = (method: string) => {
    return method === 'delivery' ? <Truck className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

  const getDeliveryLabel = (method: string) => {
    return method === 'delivery' ? 'Dikirim' : 'Diambil';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 mb-2">
              <span className="text-gray-500 font-mono text-sm">#{order.id.slice(-8)}</span>
              {getStatusBadge(order.status)}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(order.created_at)}
              </div>
              <div className="flex items-center gap-1">
                {getDeliveryIcon(order.delivery_method)}
                {getDeliveryLabel(order.delivery_method)}
                {order.delivery_method === 'delivery' && order.expedisi && (
                  <span className="text-xs">({order.expedisi})</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatPrice(order.total_amount)}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditStatus(order)}
                className="flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit Status
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(order.id)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
                Hapus
              </Button>
              {(order.status === 'ready' || order.status === 'completed') && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onWhatsAppFollowUp(order)}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-3 w-3" />
                  WA Follow Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Customer Info */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 flex-1">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{order.customer_phone}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Item Pesanan:</h4>
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <span className="font-medium text-sm">{item.product_name}</span>
                <div className="text-xs text-gray-500">
                  {formatPrice(item.product_price)} x {item.quantity}
                </div>
              </div>
              <div className="text-right">
                <span className="font-medium">{formatPrice(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-sm text-blue-900 mb-1">Catatan:</h5>
            <p className="text-sm text-blue-800">{order.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Orders;
