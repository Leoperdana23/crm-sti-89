
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
  showResellerPrice?: boolean;
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
  hasFilters,
  showResellerPrice = false
}: CatalogContentProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Order Success Message */}
      {orderSuccess && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3 mx-2 sm:mx-0">
          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
          <span className="text-green-800 text-sm sm:text-base font-medium">Pesanan berhasil dibuat!</span>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6 mx-2 sm:mx-0">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          categoryFilter={categoryFilter}
          onCategoryChange={onCategoryChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
          categories={categories}
        />
      </div>

      {/* Product Grid */}
      <div className="mx-2 sm:mx-0">
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
          showResellerPrice={showResellerPrice}
        />
      </div>
    </div>
  );
};

export default CatalogContent;
