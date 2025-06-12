
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useCreateOrder } from '@/hooks/useOrders';
import { Product } from '@/types/product';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ResellerSession {
  id: string;
  name: string;
  phone: string;
  catalogToken: string;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  catalogToken: string;
  resellerSession: ResellerSession | null;
  onOrderSuccess: () => void;
}

const CheckoutDialog = ({ isOpen, onClose, cart, catalogToken, resellerSession, onOrderSuccess }: CheckoutDialogProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [expedisi, setExpedisi] = useState('');
  
  const createOrderMutation = useCreateOrder();

  // Auto-fill reseller data when dialog opens
  useEffect(() => {
    if (isOpen && resellerSession) {
      setCustomerName(resellerSession.name);
      setCustomerPhone(resellerSession.phone);
    }
  }, [isOpen, resellerSession]);

  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      const price = item.product.reseller_price || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !customerPhone.trim()) {
      return;
    }

    if (deliveryMethod === 'delivery' && !expedisi.trim()) {
      return;
    }

    const orderData = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      catalog_token: catalogToken,
      total_amount: getTotalAmount(),
      delivery_method: deliveryMethod,
      expedisi: deliveryMethod === 'delivery' ? expedisi.trim() : undefined,
      notes: notes.trim() || undefined,
    };

    const orderItems = cart.map(item => ({
      order_id: '', // Will be set by the mutation
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.reseller_price || item.product.price,
      quantity: item.quantity,
      subtotal: (item.product.reseller_price || item.product.price) * item.quantity,
    }));

    try {
      await createOrderMutation.mutateAsync({ orderData, orderItems });
      onOrderSuccess();
      onClose();
      // Reset form
      setNotes('');
      setDeliveryMethod('pickup');
      setExpedisi('');
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Checkout Pesanan
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Ringkasan Pesanan</h4>
            <div className="space-y-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-xs">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{formatPrice((item.product.reseller_price || item.product.price) * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-1 mt-2 flex justify-between font-medium text-sm">
                <span>Total</span>
                <span>{formatPrice(getTotalAmount())}</span>
              </div>
            </div>
          </div>

          {/* Customer Information - Auto-filled and disabled */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="customerName" className="text-sm">Nama Pelanggan (Reseller)</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama pelanggan"
                disabled
                className="mt-1 bg-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor="customerPhone" className="text-sm">No. Telepon (Reseller)</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Nomor telepon"
                disabled
                className="mt-1 bg-gray-100"
              />
            </div>

            {/* Delivery Method - Editable */}
            <div>
              <Label htmlFor="deliveryMethod" className="text-sm">Metode Pengambilan *</Label>
              <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih metode pengambilan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Diambil di Toko</SelectItem>
                  <SelectItem value="delivery">Dikirim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expedisi field - only show when delivery is selected */}
            {deliveryMethod === 'delivery' && (
              <div>
                <Label htmlFor="expedisi" className="text-sm">Expedisi *</Label>
                <Input
                  id="expedisi"
                  value={expedisi}
                  onChange={(e) => setExpedisi(e.target.value)}
                  placeholder="Masukkan nama expedisi (JNE, TIKI, dll)"
                  required
                  className="mt-1"
                />
              </div>
            )}
            
            {/* Notes - Editable */}
            <div>
              <Label htmlFor="notes" className="text-sm">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan untuk pesanan"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createOrderMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={
                createOrderMutation.isPending || 
                !customerName.trim() || 
                !customerPhone.trim() ||
                (deliveryMethod === 'delivery' && !expedisi.trim())
              }
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Buat Pesanan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
