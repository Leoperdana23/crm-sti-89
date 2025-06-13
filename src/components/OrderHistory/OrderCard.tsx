
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Phone, Package, MapPin, Truck } from 'lucide-react';
import { Order, OrderItem, ORDER_STATUS_MAPPING } from '@/types/order';

interface OrderCardProps {
  order: Order & { order_items: OrderItem[] };
}

const OrderCard = ({ order }: OrderCardProps) => {
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
      pending: { label: ORDER_STATUS_MAPPING.pending, variant: 'secondary' as const },
      processing: { label: ORDER_STATUS_MAPPING.processing, variant: 'default' as const },
      completed: { label: ORDER_STATUS_MAPPING.completed, variant: 'default' as const },
      cancelled: { label: ORDER_STATUS_MAPPING.cancelled, variant: 'destructive' as const },
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
    <Card className="border border-gray-200">
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
            <div className="text-xl font-bold text-green-600">
              {formatPrice(order.total_amount)}
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

export default OrderCard;
