
import React, { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import ModernLayout from '@/components/Layout/ModernLayout';
import ProductCatalogHeader from '@/components/catalog/ProductCatalogHeader';
import ProductCatalogStats from '@/components/catalog/ProductCatalogStats';
import ProductCatalogFilters from '@/components/catalog/ProductCatalogFilters';
import ProductCatalogGrid from '@/components/catalog/ProductCatalogGrid';
import ProductForm from '@/components/ProductForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    return products
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
  }, [products, searchTerm, categoryFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setSortBy('name');
    setCurrentPage(1);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg text-muted-foreground">Memuat katalog produk...</span>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <ProductCatalogHeader
          canManageProducts={canManageProducts}
          onAddProduct={() => setProductFormOpen(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Stats */}
        <ProductCatalogStats 
          products={products}
          categories={categories}
        />

        {/* Filters */}
        <ProductCatalogFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          categoryFilter={categoryFilter}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          categories={categories}
          onResetFilters={handleResetFilters}
          filteredCount={filteredAndSortedProducts.length}
          totalCount={products.length}
        />

        {/* Product Grid */}
        <ProductCatalogGrid
          products={paginatedProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          viewMode={viewMode}
          canManageProducts={canManageProducts}
          hasFilters={Boolean(searchTerm) || categoryFilter !== 'all'}
          onResetFilters={handleResetFilters}
        />

        {/* Product Form Dialog */}
        <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
          <DialogContent className="max-w-2xl">
            <ProductForm 
              isOpen={productFormOpen} 
              onClose={() => setProductFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </ModernLayout>
  );
};

export default ProductCatalog;
