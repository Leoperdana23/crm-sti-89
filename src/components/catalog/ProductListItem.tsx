
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Edit2, Check, X } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductListItemProps {
  product: Product;
  quantity: number;
  onQuantityChange: (productId: string, quantity: number) => void;
}

const ProductListItem = ({ product, quantity, onQuantityChange }: ProductListItemProps) => {
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [editQty, setEditQty] = useState(quantity.toString());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = product.reseller_price || product.price;

  const handleQuantityIncrease = () => {
    onQuantityChange(product.id, quantity + 1);
  };

  const handleQuantityDecrease = () => {
    if (quantity > 0) {
      onQuantityChange(product.id, quantity - 1);
    }
  };

  const handleAddToCart = () => {
    onQuantityChange(product.id, 1);
  };

  const handleQtyEdit = () => {
    setEditQty(quantity.toString());
    setIsEditingQty(true);
  };

  const handleQtyConfirm = () => {
    const newQty = parseInt(editQty) || 0;
    if (newQty >= 0) {
      onQuantityChange(product.id, newQty);
    }
    setIsEditingQty(false);
  };

  const handleQtyCancel = () => {
    setEditQty(quantity.toString());
    setIsEditingQty(false);
  };

  const handleQtyKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQtyConfirm();
    } else if (e.key === 'Escape') {
      handleQtyCancel();
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Product Info - Left Side */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-900 mb-2 leading-tight">
              {product.name}
            </h3>
            
            {product.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-600 text-lg">
                {formatPrice(displayPrice)}
              </span>
              <Badge variant="outline" className="text-xs">
                {product.unit}
              </Badge>
            </div>
          </div>

          {/* Product Image and Controls - Right Side */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            {/* Product Image */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>

            {/* Quantity Controls Below Image */}
            <div className="flex flex-col items-center gap-2">
              {quantity === 0 ? (
                <Button
                  onClick={handleAddToCart}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm font-medium"
                >
                  Tambah
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full border-green-500 text-green-600 hover:bg-green-50"
                    onClick={handleQuantityDecrease}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  {isEditingQty ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min="0"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        onKeyDown={handleQtyKeyPress}
                        className="w-16 h-8 text-center text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={handleQtyConfirm}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={handleQtyCancel}
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span 
                        className="w-12 h-8 flex items-center justify-center text-sm font-medium border rounded cursor-pointer hover:bg-gray-50"
                        onClick={handleQtyEdit}
                      >
                        {quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={handleQtyEdit}
                      >
                        <Edit2 className="h-3 w-3 text-gray-500" />
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-full border-green-500 text-green-600 hover:bg-green-50"
                    onClick={handleQuantityIncrease}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {quantity > 0 && (
                <span className="text-xs text-gray-600 text-center">
                  Total: {formatPrice(displayPrice * quantity)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductListItem;
