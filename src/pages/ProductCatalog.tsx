
import React, { useState } from 'react';
import { Search, Filter, Package, Grid, List, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useProducts, useProductCategories } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/types/product';

const ProductCatalog = () => {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useProductCategories();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
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
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            <span>Filter & Pencarian</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama produk atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
              size="sm"
              className="w-full md:w-auto"
            >
              Reset Filter
            </Button>
            
            <div className="flex flex-wrap gap-2 mt-2 md:mt-4">
              <Badge variant="secondary" className="text-xs">
                Menampilkan {filteredProducts.length} produk
              </Badge>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  Pencarian: "{searchTerm}"
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Kategori: {categories?.find(c => c.id === categoryFilter)?.name}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} showResellerPrice={showResellerPrice} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductListItem key={product.id} product={product} showResellerPrice={showResellerPrice} />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 md:py-12">
            <Package className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Tidak ada produk yang sesuai filter' 
                : 'Belum ada produk'}
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              {searchTerm || categoryFilter !== 'all'
                ? 'Coba ubah kriteria pencarian atau filter Anda'
                : 'Produk akan ditampilkan di sini'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ProductCard = ({ product, showResellerPrice }: { product: Product; showResellerPrice: boolean }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = showResellerPrice && product.reseller_price 
    ? product.reseller_price 
    : product.price;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Package className="h-12 w-12 text-gray-400" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm md:text-base line-clamp-2">{product.name}</h3>
            {product.product_categories && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {product.product_categories.name}
              </Badge>
            )}
          </div>
          
          {product.description && (
            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-lg md:text-xl font-bold text-blue-600">
                {formatPrice(displayPrice)}
              </p>
              {showResellerPrice && product.reseller_price && (
                <p className="text-xs text-gray-500 line-through">
                  {formatPrice(product.price)}
                </p>
              )}
              <p className="text-xs text-gray-500">per {product.unit}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductListItem = ({ product, showResellerPrice }: { product: Product; showResellerPrice: boolean }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = showResellerPrice && product.reseller_price 
    ? product.reseller_price 
    : product.price;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-8 w-8 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-sm md:text-base">{product.name}</h3>
                {product.description && (
                  <p className="text-xs md:text-sm text-gray-600 mt-1">{product.description}</p>
                )}
                {product.product_categories && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {product.product_categories.name}
                  </Badge>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-lg md:text-xl font-bold text-blue-600">
                  {formatPrice(displayPrice)}
                </p>
                {showResellerPrice && product.reseller_price && (
                  <p className="text-xs text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </p>
                )}
                <p className="text-xs text-gray-500">per {product.unit}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCatalog;
