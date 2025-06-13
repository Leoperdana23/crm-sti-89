
import React, { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/product';
import CatalogContent from '@/components/PublicCatalog/CatalogContent';
import CatalogHeader from '@/components/PublicCatalog/CatalogHeader';

const PRODUCTS_PER_PAGE = 20;

const PublicCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        console.log('Fetching public catalog data...');

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            product_categories (
              name
            )
          `)
          .eq('is_active', true)
          .order('name');

        if (productsError) {
          console.error('Error fetching products:', productsError);
          // Try simple query without join
          const { data: simpleProductsData, error: simpleProductsError } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('name');

          if (simpleProductsError) {
            setError('Gagal memuat produk');
            setIsLoading(false);
            return;
          }
          setProducts(simpleProductsData || []);
        } else {
          setProducts(productsData || []);
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('product_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          setCategories([]);
        } else {
          setCategories(categoriesData || []);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
        setError('Terjadi kesalahan saat memuat katalog');
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

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
          return (a.reseller_price || a.price) - (b.reseller_price || b.price);
        case 'price-high':
          return (b.reseller_price || b.price) - (a.reseller_price || a.price);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-green-500" />
          <span className="text-sm sm:text-base text-gray-700">Memuat katalog produk...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="text-center py-6 sm:py-8 px-4 sm:px-6">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 break-words">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader />

      <CatalogContent
        orderSuccess={false}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        paginatedProducts={paginatedProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        getProductQuantity={() => 0}
        onAddToCart={() => {}}
        onRemoveFromCart={() => {}}
        onResetSearch={handleResetSearch}
        hasFilters={hasFilters}
      />
    </div>
  );
};

export default PublicCatalog;
