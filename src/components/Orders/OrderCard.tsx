
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Phone, 
  MapPin,
  User,
  Building2,
  Calendar,
  ShoppingCart
} from 'lucide-react';
import { Order, OrderItem } from '@/types/order';
import { useBranches } from '@/hooks/useBranches';

interface OrderCardProps {
  order: Order & { order_items: OrderItem[] };
  onEditStatus: (order: Order) => void;
  onWhatsAppFollowUp: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

const OrderCard = ({ order, onEditStatus, onWhatsAppFollowUp, onDelete }: OrderCardProps) => {
  const { branches } = useBranches();

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
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to get branch name from branch_id
  const getBranchName = (branchId: string | undefined) => {
    if (!branchId) return null;
    const branch = branches?.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">#{order.id.slice(-8)}</h3>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {order.reseller && (
                  <>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-blue-700">{order.reseller.name}</span>
                    </div>
                    {order.reseller.branch_id && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-700">{getBranchName(order.reseller.branch_id)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-lg">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {order.delivery_method && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>
                    {order.delivery_method === 'pickup' ? 'Diambil di Toko' : 'Dikirim'}
                    {order.expedisi && ` via ${order.expedisi}`}
                  </span>
                </div>
              </div>
            )}

            {order.notes && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEditStatus(order)}
              className="flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onWhatsAppFollowUp(order)}
              className="flex items-center gap-1 text-green-600 hover:text-green-700"
            >
              <MessageSquare className="h-3 w-3" />
              WA
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(order.id)}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
              Hapus
            </Button>
          </div>
        </div>

        {order.order_items && order.order_items.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Item Pesanan:</h4>
            <div className="space-y-1">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
