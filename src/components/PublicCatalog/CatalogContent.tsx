
import React from 'react';
import { CheckCircle } from 'lucide-react';
import SearchAndFilter from '@/components/catalog/SearchAndFilter';
import ProductGrid from '@/components/catalog/ProductGrid';
import { Product, ProductCategory } from '@/types/product';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Order Success Message */}
        {orderSuccess && (
          <Alert className="bg-green-50 border-green-200 mx-2 sm:mx-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              Pesanan berhasil dibuat!
            </AlertDescription>
          </Alert>
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
    </div>
  );
};

export default CatalogContent;
