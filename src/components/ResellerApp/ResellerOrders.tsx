
import React, { useState, useEffect } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerOrderHistory } from '@/hooks/useResellerOrderHistory';
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
  const { data: orderHistory, isLoading: loading, refetch } = useResellerOrderHistory(reseller.id);
  const [activeTab, setActiveTab] = useState('all');

  // Set up real-time subscription for order updates
  useEffect(() => {
    const channel = supabase
      .channel('reseller-order-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reseller_order_history',
          filter: `reseller_id=eq.${reseller.id}`
        },
        (payload) => {
          console.log('Reseller order history updated:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, reseller.id]);

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
      case 'processing':
      case 'proses':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'batal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
      case 'proses':
        return <Package className="h-4 w-4" />;
      case 'completed':
      case 'selesai':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'batal':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const mapping: { [key: string]: string } = {
      'processing': 'Proses',
      'proses': 'Proses', 
      'completed': 'Selesai',
      'selesai': 'Selesai',
      'cancelled': 'Batal',
      'batal': 'Batal'
    };
    return mapping[status.toLowerCase()] || status;
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === 'all') return orderHistory || [];
    return (orderHistory || []).filter(order => {
      const orderStatus = order.order_status?.toLowerCase();
      if (status === 'proses') return orderStatus === 'processing' || orderStatus === 'proses';
      if (status === 'selesai') return orderStatus === 'completed' || orderStatus === 'selesai';
      if (status === 'batal') return orderStatus === 'cancelled' || orderStatus === 'batal';
      return orderStatus === status.toLowerCase();
    });
  };

  const renderOrderCard = (order: any) => {
    return (
      <Card key={order.id}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm">
                Order #{order.order_id?.slice(-8)}
              </CardTitle>
              <p className="text-xs text-gray-500">
                {formatDate(order.order_date)}
              </p>
            </div>
            <Badge className={getStatusColor(order.order_status || 'pending')}>
              <span className="flex items-center gap-1">
                {getStatusIcon(order.order_status || 'pending')}
                {getStatusLabel(order.order_status || 'pending')}
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
              <span className="text-gray-600">Komisi:</span>
              <span className="font-medium text-green-600">{formatCurrency(order.commission_earned || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Poin:</span>
              <span className="font-medium text-blue-600">{order.points_earned || 0} poin</span>
            </div>
            
            {/* Order Items from JSONB */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-600 mb-2">Produk:</p>
                {order.order_items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs mb-1">
                    <span>{item.quantity}x {item.product_name}</span>
                    <div className="text-right">
                      <div>{formatCurrency(item.subtotal)}</div>
                      <div className="flex gap-2">
                        {item.points_snapshot > 0 && (
                          <div className="text-blue-600">{item.points_snapshot * item.quantity} poin</div>
                        )}
                        {item.commission_snapshot > 0 && (
                          <div className="text-green-600">
                            +{formatCurrency(item.commission_snapshot * item.quantity)}
                          </div>
                        )}
                      </div>
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
      <h2 className="text-xl font-bold">Riwayat Order (Dari Histori)</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Semua ({(orderHistory || []).length})</TabsTrigger>
          <TabsTrigger value="proses">Proses ({filterOrdersByStatus('proses').length})</TabsTrigger>
          <TabsTrigger value="selesai">Selesai ({filterOrdersByStatus('selesai').length})</TabsTrigger>
          <TabsTrigger value="batal">Batal ({filterOrdersByStatus('batal').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {(orderHistory || []).map(renderOrderCard)}
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

      {(orderHistory || []).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada order</p>
        </div>
      )}
    </div>
  );
};

export default ResellerOrders;
