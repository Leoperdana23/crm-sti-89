
import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  canManage?: boolean;
  getProductQuantity?: (productId: string) => number;
  onAddToCart?: (product: Product) => void;
  onRemoveFromCart?: (productId: string) => void;
  showResellerPrice?: boolean;
}

const ProductList = ({
  products,
  canManage = false,
  getProductQuantity = () => 0,
  onAddToCart = () => {},
  onRemoveFromCart = () => {},
  showResellerPrice = false
}: ProductListProps) => {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
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
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(showResellerPrice && product.reseller_price ? product.reseller_price : product.price)}
                  </p>
                  {showResellerPrice && product.reseller_price && (
                    <p className="text-sm text-muted-foreground line-through">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(product.price)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">per {product.unit}</p>
                </div>
                
                {product.product_categories && (
                  <div className="text-right">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {product.product_categories.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
