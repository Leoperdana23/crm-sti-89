
import React from 'react';
import { CheckCircle } from 'lucide-react';
import SearchAndFilter from '@/components/catalog/SearchAndFilter';
import ProductGrid from '@/components/catalog/ProductGrid';
import { Product, ProductCategory } from '@/types/product';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CatalogContentProps {
  orderSuccess: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categories: ProductCategory[];
  paginatedProducts: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getProductQuantity: (productId: string) => number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onResetSearch: () => void;
  hasFilters: boolean;
}

const CatalogContent = ({
  orderSuccess,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
  paginatedProducts,
  currentPage,
  totalPages,
  onPageChange,
  getProductQuantity,
  onAddToCart,
  onRemoveFromCart,
  onResetSearch,
  hasFilters
}: CatalogContentProps) => {
  return (
    <div className="w-full max-w-sm mx-auto px-3 py-3 space-y-3">
      {/* Order Success Message */}
      {orderSuccess && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 text-sm font-medium">Pesanan berhasil dibuat!</span>
        </div>
      )}

      {/* Search and Filter */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        categories={categories}
      />

      {/* Product Grid */}
      <ProductGrid
        products={paginatedProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        getProductQuantity={getProductQuantity}
        onAddToCart={onAddToCart}
        onRemoveFromCart={onRemoveFromCart}
        onResetSearch={onResetSearch}
        hasFilters={hasFilters}
      />
    </div>
  );
};

export default CatalogContent;
