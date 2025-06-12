
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Product } from '@/types/product';
import ProductListItem from './ProductListItem';

interface ProductGridProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getProductQuantity: (productId: string) => number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onResetSearch: () => void;
  hasFilters: boolean;
}

const ProductGrid = ({
  products,
  currentPage,
  totalPages,
  onPageChange,
  getProductQuantity,
  onAddToCart,
  onRemoveFromCart,
  onResetSearch,
  hasFilters
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <Card className="shadow-sm border-0">
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {hasFilters ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          </h3>
          <p className="text-gray-500 mb-3 text-sm">
            {hasFilters
              ? 'Coba ubah kata kunci atau filter pencarian Anda'
              : 'Produk akan segera ditambahkan'}
          </p>
          {hasFilters && (
            <Button 
              onClick={onResetSearch}
              variant="outline"
              className="border-green-200 text-green-600 hover:bg-green-50 text-sm"
            >
              Reset Pencarian
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {products.map((product) => (
          <ProductListItem 
            key={product.id} 
            product={product} 
            quantity={getProductQuantity(product.id)}
            onAdd={() => onAddToCart(product)}
            onRemove={() => onRemoveFromCart(product.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(page);
                      }}
                      isActive={currentPage === page}
                      className="text-sm"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default ProductGrid;
