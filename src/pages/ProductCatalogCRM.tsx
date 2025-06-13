
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import ProductCatalogHeader from '@/components/catalog/ProductCatalogHeader';
import ProductCatalogStats from '@/components/catalog/ProductCatalogStats';
import ProductCatalogFilters from '@/components/catalog/ProductCatalogFilters';
import ProductCatalogGridCRM from '@/components/catalog/ProductCatalogGridCRM';
import CategoryManagement from '@/components/catalog/CategoryManagement';
import ProductForm from '@/components/ProductForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Product } from '@/types/product';

const PRODUCTS_PER_PAGE = 20;

const ProductCatalogCRM = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { hasPermission } = useUserPermissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [priceView, setPriceView] = useState<'retail' | 'reseller'>('retail');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const canManageProducts = hasPermission('product_management') || hasPermission('product_create');

  // Filter and sort products dengan dukungan harga reseller
  const filteredAndSortedProducts = React.useMemo(() => {
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
            const priceA = priceView === 'reseller' && a.reseller_price ? a.reseller_price : a.price;
            const priceB = priceView === 'reseller' && b.reseller_price ? b.reseller_price : b.price;
            return priceA - priceB;
          case 'price-high':
            const priceA2 = priceView === 'reseller' && a.reseller_price ? a.reseller_price : a.price;
            const priceB2 = priceView === 'reseller' && b.reseller_price ? b.reseller_price : b.price;
            return priceB2 - priceA2;
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [products, searchTerm, categoryFilter, sortBy, priceView]);

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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleCloseProductForm = () => {
    setProductFormOpen(false);
    setEditingProduct(undefined);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Memuat katalog produk...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="space-y-8 p-4 md:p-6">
        {/* Header dengan toggle harga */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Produk</h1>
          
          {/* Price View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Tampilan Harga:</span>
            <select 
              value={priceView} 
              onChange={(e) => setPriceView(e.target.value as 'retail' | 'reseller')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="retail">Harga Retail</option>
              <option value="reseller">Harga Reseller</option>
            </select>
          </div>
        </div>

        {/* Tabs for Products and Categories */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Produk</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Header dengan aksi produk */}
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

            {/* Product Grid dengan support harga reseller */}
            <ProductCatalogGridCRM
              products={paginatedProducts.map(product => ({
                ...product,
                displayPrice: priceView === 'reseller' && product.reseller_price 
                  ? product.reseller_price 
                  : product.price,
                showResellerPrice: priceView === 'reseller'
              }))}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              viewMode={viewMode}
              canManageProducts={canManageProducts}
              hasFilters={Boolean(searchTerm) || categoryFilter !== 'all'}
              onResetFilters={handleResetFilters}
              onEditProduct={handleEditProduct}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManagement />
          </TabsContent>
        </Tabs>

        {/* Product Form Dialog */}
        <Dialog open={productFormOpen} onOpenChange={handleCloseProductForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <ProductForm 
              product={editingProduct}
              onSuccess={handleCloseProductForm}
              onCancel={handleCloseProductForm}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProductCatalogCRM;
