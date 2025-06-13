
import React from 'react';
import { Product } from '@/types/product';
import ProductCardCRM from './ProductCardCRM';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteProduct } from '@/hooks/useProducts';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ProductCatalogGridCRMProps {
  products: (Product & { displayPrice?: number; showResellerPrice?: boolean })[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  viewMode: 'grid' | 'list';
  canManageProducts: boolean;
  hasFilters: boolean;
  onResetFilters: () => void;
  onEditProduct?: (product: Product) => void;
}

const ProductCatalogGridCRM = ({
  products,
  currentPage,
  totalPages,
  onPageChange,
  viewMode,
  canManageProducts,
  hasFilters,
  onResetFilters,
  onEditProduct
}: ProductCatalogGridCRMProps) => {
  const deleteProductMutation = useDeleteProduct();

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            {hasFilters ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">Tidak ada produk ditemukan</h3>
                <p className="text-muted-foreground">
                  Coba ubah filter pencarian atau reset filter untuk melihat semua produk.
                </p>
                <Button onClick={onResetFilters} variant="outline">
                  Reset Filter
                </Button>
              </>
            ) : (
              <>
                <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">Belum ada produk</h3>
                <p className="text-muted-foreground">
                  Mulai dengan menambahkan produk pertama Anda.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        items.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return items;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCardCRM
                  key={product.id}
                  product={product}
                  canManage={canManageProducts}
                  onEdit={() => onEditProduct?.(product)}
                  onDelete={() => handleDeleteProduct(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
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
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(product.displayPrice || product.price)}
                          </p>
                          {product.showResellerPrice && product.reseller_price && (
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
                        
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Stok: {product.stock_quantity || 0}</p>
                          {product.product_categories && (
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                              {product.product_categories.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {getPaginationItems().map((item, index) => (
                <PaginationItem key={index}>
                  {item === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => onPageChange(item as number)}
                      isActive={currentPage === item}
                      className="cursor-pointer"
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogGridCRM;
