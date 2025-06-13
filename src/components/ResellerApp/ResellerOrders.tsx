
import React, { useState } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerOrders } from '@/hooks/useResellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { ORDER_STATUS_MAPPING } from '@/types/order';

interface ResellerOrdersProps {
  reseller: ResellerSession;
}

const ResellerOrders: React.FC<ResellerOrdersProps> = ({ reseller }) => {
  const { orders, loading } = useResellerOrders(reseller.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return ORDER_STATUS_MAPPING[status as keyof typeof ORDER_STATUS_MAPPING] || status;
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.order?.status.toLowerCase() === status.toLowerCase());
  };

  const renderOrderCard = (order: any) => (
    <Card key={order.id}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm">
              Order #{order.order_id.slice(-8)}
            </CardTitle>
            <p className="text-xs text-gray-500">
              {formatDate(order.created_at)}
            </p>
          </div>
          <Badge className={getStatusColor(order.order?.status || 'pending')}>
            <span className="flex items-center gap-1">
              {getStatusIcon(order.order?.status || 'pending')}
              {getStatusLabel(order.order?.status || 'pending')}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{order.order?.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Order:</span>
            <span className="font-medium">{formatCurrency(order.order?.total_amount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Komisi ({order.commission_rate}%):</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(order.commission_amount)}
            </span>
          </div>
          
          {/* Order Items */}
          {order.order?.order_items && order.order.order_items.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-600 mb-2">Produk:</p>
              {order.order.order_items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Riwayat Order</h2>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Semua ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Menunggu ({filterOrdersByStatus('pending').length})</TabsTrigger>
          <TabsTrigger value="processing">Proses ({filterOrdersByStatus('processing').length})</TabsTrigger>
          <TabsTrigger value="completed">Selesai ({filterOrdersByStatus('completed').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Batal ({filterOrdersByStatus('cancelled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {orders.map(renderOrderCard)}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterOrdersByStatus('pending').map(renderOrderCard)}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {filterOrdersByStatus('processing').map(renderOrderCard)}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterOrdersByStatus('completed').map(renderOrderCard)}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filterOrdersByStatus('cancelled').map(renderOrderCard)}
        </TabsContent>
      </Tabs>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada order</p>
        </div>
      )}
    </div>
  );
};

export default ResellerOrders;
