import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Clock, Package, CheckCircle, XCircle, MessageCircle, Trash2 } from 'lucide-react';
import { Order } from '@/types/order';
import { formatCurrency, formatDate } from '@/lib/utils';
import PrintOrderDialog from './PrintOrderDialog';

interface OrderCardProps {
  order: Order;
  onUpdateStatus?: (orderId: string, status: string) => void;
  onViewHistory?: (order: Order) => void;
  onEditStatus?: (order: Order) => void;
  onWhatsAppFollowUp?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
}

const getBranchName = (notes: string | undefined): string | undefined => {
  if (!notes) return undefined;
  const branchRegex = /Cabang: (.+)/;
  const match = notes.match(branchRegex);
  return match ? match[1] : undefined;
};

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onUpdateStatus, 
  onViewHistory, 
  onEditStatus,
  onWhatsAppFollowUp,
  onDelete
}) => {
  const [localStatus, setLocalStatus] = useState(order.status);

  const handleStatusChange = (value: string) => {
    setLocalStatus(value);
    onUpdateStatus?.(order.id, value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
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
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const mapping: { [key: string]: string } = {
      'pending': 'Menunggu',
      'processing': 'Proses',
      'proses': 'Proses',
      'completed': 'Selesai',
      'selesai': 'Selesai',
      'cancelled': 'Batal',
      'batal': 'Batal'
    };
    return mapping[status.toLowerCase()] || status;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
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
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(order.status || 'pending')}>
              <span className="flex items-center gap-1">
                {getStatusIcon(order.status || 'pending')}
                {getStatusLabel(order.status || 'pending')}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{order.customer_phone}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium">{formatCurrency(order.total_amount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery:</span>
            <span className="font-medium capitalize">{order.delivery_method || 'pickup'}</span>
          </div>
          
          {/* Show expedisi if delivery method is delivery */}
          {order.delivery_method === 'delivery' && order.expedisi && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expedisi:</span>
              <span className="font-medium">{order.expedisi}</span>
            </div>
          )}

          {/* Show reseller info if available */}
          {order.reseller && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Reseller:</span>
              <span className="font-medium">{order.reseller.name}</span>
            </div>
          )}

          {/* Show branch info if available */}
          {getBranchName(order.notes) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cabang:</span>
              <span className="font-medium">{getBranchName(order.notes)}</span>
            </div>
          )}
          
          {order.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <span className="text-gray-600">Notes: </span>
              <span>{order.notes}</span>
            </div>
          )}
          
          {/* Order Items */}
          {order.order_items && order.order_items.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-600 mb-2">Items:</p>
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between text-xs mb-1">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-2 border-t">
            {/* Print Button */}
            <PrintOrderDialog order={order} />
            
            {/* Status Update Dropdown */}
            <Select value={localStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="processing">Proses</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            
            {/* WhatsApp Follow Up Button */}
            {onWhatsAppFollowUp && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWhatsAppFollowUp(order)}
                className="h-8 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WA
              </Button>
            )}
            
            {/* View History Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory?.(order)}
              className="h-8 text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              History
            </Button>

            {/* Delete Button */}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(order.id)}
                className="h-8 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
