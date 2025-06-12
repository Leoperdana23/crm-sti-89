
import React from 'react';
import { Package, Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';

interface ProductListItemProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductListItem = ({ product, quantity, onAdd, onRemove }: ProductListItemProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = product.reseller_price || product.price;
  const hasDiscount = product.reseller_price && product.reseller_price < product.price;
  const categoryName = product.product_categories?.name || 'Uncategorized';

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          {/* Product Image */}
          <div className="relative w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                  {product.name}
                </h3>
                
                {/* Category */}
                <p className="text-xs text-gray-500 mb-1">
                  {categoryName}
                </p>

                {/* Price */}
                <div className="flex items-baseline space-x-1 mb-1">
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              
              {/* Add/Remove Controls */}
              <div className="flex flex-col items-end justify-center h-full ml-2">
                {quantity === 0 ? (
                  <Button
                    onClick={onAdd}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium text-xs h-7 w-8"
                  >
                    +
                  </Button>
                ) : (
                  <div className="flex items-center bg-green-600 rounded-lg overflow-hidden">
                    <Button
                      size="sm"
                      onClick={onRemove}
                      className="bg-green-600 hover:bg-green-700 text-white w-6 h-6 p-0 rounded-none"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-white font-semibold px-2 py-1 bg-green-600 text-xs min-w-[28px] text-center">
                      {quantity}
                    </span>
                    <Button
                      size="sm"
                      onClick={onAdd}
                      className="bg-green-600 hover:bg-green-700 text-white w-6 h-6 p-0 rounded-none"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductListItem;
