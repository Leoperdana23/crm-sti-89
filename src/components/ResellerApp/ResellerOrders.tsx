
import React, { useState, useEffect } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ResellerOrdersProps {
  reseller: ResellerSession;
}

const ResellerOrders: React.FC<ResellerOrdersProps> = ({ reseller }) => {
  const { data: orders, isLoading: loading, refetch } = useResellerOrders(reseller.id);
  const [activeTab, setActiveTab] = useState('all');

  // Set up real-time subscription for order updates
  useEffect(() => {
    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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
      case 'proses':
        return 'bg-blue-100 text-blue-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'batal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'proses':
        return <Package className="h-4 w-4" />;
      case 'selesai':
        return <CheckCircle className="h-4 w-4" />;
      case 'batal':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const mapping: { [key: string]: string } = {
      'pending': 'Menunggu',
      'proses': 'Proses', 
      'selesai': 'Selesai',
      'batal': 'Batal'
    };
    return mapping[status.toLowerCase()] || status;
  };

  const calculateCommission = (totalAmount: number) => {
    return (totalAmount * (reseller.commission_rate / 100));
  };

  const calculateTotalPoints = (orderItems: any[]) => {
    return orderItems.reduce((total, item) => {
      return total + (item.points_earned || 0);
    }, 0);
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === 'all') return orders || [];
    return (orders || []).filter(order => order.status?.toLowerCase() === status.toLowerCase());
  };

  const renderOrderCard = (order: any) => {
    const commission = calculateCommission(order.total_amount || 0);
    const totalPoints = calculateTotalPoints(order.order_items || []);

    return (
      <Card key={order.id}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm">
                Order #{order.id?.slice(-8)}
              </CardTitle>
              <p className="text-xs text-gray-500">
                {formatDate(order.created_at)}
              </p>
            </div>
            <Badge className={getStatusColor(order.status || 'pending')}>
              <span className="flex items-center gap-1">
                {getStatusIcon(order.status || 'pending')}
                {getStatusLabel(order.status || 'pending')}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Order:</span>
              <span className="font-medium">{formatCurrency(order.total_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Komisi ({reseller.commission_rate}%):</span>
              <span className="font-medium text-green-600">{formatCurrency(commission)}</span>
            </div>
            {totalPoints > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Poin:</span>
                <span className="font-medium text-blue-600">{totalPoints} poin</span>
              </div>
            )}
            
            {/* Order Items */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-600 mb-2">Produk:</p>
                {order.order_items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs mb-1">
                    <span>{item.quantity}x {item.product_name}</span>
                    <div className="text-right">
                      <div>{formatCurrency(item.subtotal)}</div>
                      {item.points_earned > 0 && (
                        <div className="text-blue-600">{item.points_earned} poin</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Semua ({(orders || []).length})</TabsTrigger>
          <TabsTrigger value="pending">Menunggu ({filterOrdersByStatus('pending').length})</TabsTrigger>
          <TabsTrigger value="proses">Proses ({filterOrdersByStatus('proses').length})</TabsTrigger>
          <TabsTrigger value="selesai">Selesai ({filterOrdersByStatus('selesai').length})</TabsTrigger>
          <TabsTrigger value="batal">Batal ({filterOrdersByStatus('batal').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {(orders || []).map(renderOrderCard)}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterOrdersByStatus('pending').map(renderOrderCard)}
        </TabsContent>

        <TabsContent value="proses" className="space-y-4">
          {filterOrdersByStatus('proses').map(renderOrderCard)}
        </TabsContent>

        <TabsContent value="selesai" className="space-y-4">
          {filterOrdersByStatus('selesai').map(renderOrderCard)}
        </TabsContent>

        <TabsContent value="batal" className="space-y-4">
          {filterOrdersByStatus('batal').map(renderOrderCard)}
        </TabsContent>
      </Tabs>

      {(orders || []).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada order</p>
        </div>
      )}
    </div>
  );
};

export default ResellerOrders;
