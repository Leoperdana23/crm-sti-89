
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Product, ProductCategory } from '@/types/product';
import ModernLayout from '@/components/Layout/ModernLayout';
import ProductForm from '@/components/ProductForm';
import ProductGrid from '@/components/catalog/ProductGrid';
import SearchAndFilter from '@/components/catalog/SearchAndFilter';
import ProductActions from '@/components/catalog/ProductActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';

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
      <ModernLayout>
        <div className="flex items-center justify-center min-h-[400px]">
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Katalog Produk
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola produk dan inventori Anda
            </p>
          </div>
          
          <ProductActions
            canManageProducts={canManageProducts}
            setProductFormOpen={setProductFormOpen}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Produk</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Produk Aktif</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-yellow-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Stok Rendah</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.stock_quantity <= p.min_stock_level).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              categoryFilter={categoryFilter}
              onCategoryChange={handleCategoryChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categories={categories}
            />
          </CardContent>
        </Card>

        {/* Product Grid */}
        <Card>
          <CardContent className="p-6">
            <ProductGrid
              products={paginatedProducts}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onResetSearch={handleResetSearch}
              hasFilters={hasFilters}
              viewMode={viewMode}
            />
          </CardContent>
        </Card>

        <ProductForm 
          isOpen={productFormOpen} 
          onClose={() => setProductFormOpen(false)} 
        />
      </div>
    </ModernLayout>
  );
};

export default ProductCatalog;
