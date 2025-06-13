
import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import ProductList from './ProductList';
import EmptyState from './EmptyState';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ProductGridProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getProductQuantity?: (productId: string) => number;
  onAddToCart?: (product: Product) => void;
  onRemoveFromCart?: (productId: string) => void;
  onResetSearch: () => void;
  hasFilters: boolean;
  viewMode?: 'grid' | 'list';
  showResellerPrice?: boolean;
}

const ProductGrid = ({
  products,
  currentPage,
  totalPages,
  onPageChange,
  getProductQuantity = () => 0,
  onAddToCart = () => {},
  onRemoveFromCart = () => {},
  onResetSearch,
  hasFilters,
  viewMode = 'grid',
  showResellerPrice = false
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <EmptyState
        onResetSearch={onResetSearch}
        hasFilters={hasFilters}
      />
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
    <div className="space-y-4 sm:space-y-6">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getProductQuantity(product.id)}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              showResellerPrice={showResellerPrice}
            />
          ))}
        </div>
      ) : (
        <ProductList
          products={products}
          getProductQuantity={getProductQuantity}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          showResellerPrice={showResellerPrice}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center py-4 sm:py-6">
          <Pagination>
            <PaginationContent className="flex flex-wrap gap-1 sm:gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={`text-xs sm:text-sm ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                />
              </PaginationItem>

              {getPaginationItems().map((item, index) => (
                <PaginationItem key={index}>
                  {item === '...' ? (
                    <PaginationEllipsis className="text-xs sm:text-sm" />
                  ) : (
                    <PaginationLink
                      onClick={() => onPageChange(item as number)}
                      isActive={currentPage === item}
                      className="text-xs sm:text-sm cursor-pointer min-w-[32px] sm:min-w-[40px]"
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  className={`text-xs sm:text-sm ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
