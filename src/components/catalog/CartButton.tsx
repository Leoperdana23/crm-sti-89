
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartItem {
  product: any;
  quantity: number;
}

interface CartButtonProps {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  onClick: () => void;
}

const CartButton = ({ cart, totalItems, totalPrice, onClick }: CartButtonProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-3">
      <Button
        onClick={onClick}
        className="w-full bg-green-600 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-lg hover:bg-green-700"
      >
        <div className="flex items-center space-x-2">
          <div className="bg-green-700 rounded-full p-1.5">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">
              {totalItems} item
            </div>
            <div className="text-xs opacity-90 truncate max-w-24">
              {cart.map(item => item.product.name).join(', ')}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-base">
            {formatPrice(totalPrice)}
          </div>
        </div>
      </Button>
    </div>
  );
};

export default CartButton;
