import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useProducts, useProductCategories, useDeleteProduct } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Product } from '@/types/product';
import ProductForm from '@/components/ProductForm';
import ProductCategoryForm from '@/components/ProductCategoryForm';
import CatalogTokenManager from '@/components/CatalogTokenManager';
import ProductFilters from '@/components/catalog/ProductFilters';
import ProductActions from '@/components/catalog/ProductActions';
import ProductCard from '@/components/catalog/ProductCard';
import ProductList from '@/components/catalog/ProductList';
import EmptyState from '@/components/catalog/EmptyState';

const ProductCatalog = () => {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useProductCategories();
  const { user } = useAuth();
  const { hasPermission } = useUserPermissions();
  const deleteProductMutation = useDeleteProduct();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [tokenManagerOpen, setTokenManagerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  // Check if user is a reseller
  const isReseller = () => {
    const salesUser = localStorage.getItem('salesUser');
    if (salesUser) return false; // Sales users are not resellers
    
    const appUser = localStorage.getItem('appUser');
    if (appUser) {
      try {
        const parsedUser = JSON.parse(appUser);
        return parsedUser.user_metadata?.role === 'reseller' || parsedUser.role === 'reseller';
      } catch (error) {
        return false;
      }
    }
    
    return user?.user_metadata?.role === 'reseller';
  };

  const showResellerPrice = isReseller();
  const canManageProducts = hasPermission('product_management', 'edit');

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCloseProductForm = () => {
    setProductFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleCloseCategoryForm = () => {
    setCategoryFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] md:min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
          <span className="text-sm md:text-base">Memuat katalog produk...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Katalog Produk</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            {showResellerPrice ? 'Daftar harga khusus reseller' : 'Daftar produk tersedia'}
          </p>
        </div>
        
        <ProductActions
          canManageProducts={canManageProducts}
          setTokenManagerOpen={setTokenManagerOpen}
          setProductFormOpen={setProductFormOpen}
          setCategoryFormOpen={setCategoryFormOpen}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* Search and Filter */}
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        filteredProductsCount={filteredProducts.length}
      />

      {/* Product List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              showResellerPrice={showResellerPrice}
              canManage={canManageProducts}
              onEdit={() => handleEditProduct(product)}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductList 
              key={product.id} 
              product={product} 
              showResellerPrice={showResellerPrice}
              canManage={canManageProducts}
              onEdit={() => handleEditProduct(product)}
              onDelete={() => handleDeleteProduct(product.id)}
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <EmptyState searchTerm={searchTerm} categoryFilter={categoryFilter} />
      )}

      {/* Modals */}
      <ProductForm 
        isOpen={productFormOpen}
        onClose={handleCloseProductForm}
        product={editingProduct}
      />

      <ProductCategoryForm 
        isOpen={categoryFormOpen}
        onClose={handleCloseCategoryForm}
      />

      <CatalogTokenManager 
        isOpen={tokenManagerOpen}
        onClose={() => setTokenManagerOpen(false)}
      />
    </div>
  );
};

export default ProductCatalog;
