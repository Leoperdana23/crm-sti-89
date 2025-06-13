
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Product, ProductCategory } from '@/types/product';
import Layout from '@/components/Layout';
import ProductForm from '@/components/ProductForm';
import ProductGrid from '@/components/catalog/ProductGrid';
import SearchAndFilter from '@/components/catalog/SearchAndFilter';
import ProductActions from '@/components/catalog/ProductActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const PRODUCTS_PER_PAGE = 20;

const ProductCatalog = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { hasPermission } = useUserPermissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [productFormOpen, setProductFormOpen] = useState(false);

  const canManageProducts = hasPermission('product_management') || hasPermission('product_create');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setCurrentPage(1);
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const hasFilters = Boolean(searchTerm || categoryFilter !== 'all');

  if (productsLoading || categoriesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg">Memuat katalog produk...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Katalog Produk
            </h1>
            
            <ProductActions
              canManageProducts={canManageProducts}
              setProductFormOpen={setProductFormOpen}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6">
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              categoryFilter={categoryFilter}
              onCategoryChange={handleCategoryChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categories={categories}
            />
          </div>
        </div>

        <ProductGrid
          products={paginatedProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onResetSearch={handleResetSearch}
          hasFilters={hasFilters}
          viewMode={viewMode}
        />

        <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
          <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <ProductForm onClose={() => setProductFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ProductCatalog;
