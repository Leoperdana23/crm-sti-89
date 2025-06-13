
import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import ProductList from './ProductList';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ProductCatalogGridProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  viewMode: 'grid' | 'list';
  canManageProducts: boolean;
  hasFilters: boolean;
  onResetFilters: () => void;
}

const ProductCatalogGrid = ({
  products,
  currentPage,
  totalPages,
  onPageChange,
  viewMode,
  canManageProducts,
  hasFilters,
  onResetFilters
}: ProductCatalogGridProps) => {
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
                <ProductCard
                  key={product.id}
                  product={product}
                  canManage={canManageProducts}
                />
              ))}
            </div>
          ) : (
            <ProductList
              products={products}
              canManage={canManageProducts}
            />
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

export default ProductCatalogGrid;
