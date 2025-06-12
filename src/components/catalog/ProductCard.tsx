
import React from 'react';
import { Package, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  showResellerPrice: boolean;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductCard = ({ 
  product, 
  showResellerPrice, 
  canManage, 
  onEdit, 
  onDelete 
}: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = showResellerPrice && product.reseller_price 
    ? product.reseller_price 
    : product.price;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Package className="h-12 w-12 text-gray-400" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm md:text-base line-clamp-2">{product.name}</h3>
            {product.product_categories && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {product.product_categories.name}
              </Badge>
            )}
          </div>
          
          {product.description && (
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-lg md:text-xl font-bold text-blue-600">
                {formatPrice(displayPrice)}
              </p>
              {showResellerPrice && product.reseller_price && (
                <p className="text-xs text-gray-500 line-through">
                  {formatPrice(product.price)}
                </p>
              )}
              <p className="text-xs text-gray-500">per {product.unit}</p>
            </div>
          </div>

          {canManage && (
            <div className="flex items-center space-x-2 pt-2">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus produk "{product.name}"? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>Hapus</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
