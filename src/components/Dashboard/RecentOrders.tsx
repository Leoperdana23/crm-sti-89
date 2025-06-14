
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const RecentOrders = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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
      processing: { label: 'Proses', variant: 'default' as const },
      completed: { label: 'Selesai', variant: 'default' as const },
      cancelled: { label: 'Batal', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {stats?.recent_orders && stats.recent_orders.length > 0 ? (
          <div className="space-y-4">
            {stats.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{order.customer_name}</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
                  <p className="text-xs text-gray-500">#{order.id.slice(-8)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Belum ada pesanan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
