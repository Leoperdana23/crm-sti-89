
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, Package, Grid, List } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/product';

const PublicCatalog = () => {
  const { token } = useParams<{ token: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCatalogData = async () => {
      if (!token) {
        setError('Token tidak valid');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Verifying token:', token);
        
        // Verify token first
        const { data: tokenData, error: tokenError } = await supabase
          .from('catalog_tokens')
          .select('*')
          .eq('token', token)
          .eq('is_active', true)
          .single();

        if (tokenError || !tokenData) {
          console.error('Token verification failed:', tokenError);
          setError('Token tidak valid atau sudah kedaluwarsa');
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
          setError('Token sudah kedaluwarsa');
          setIsLoading(false);
          return;
        }

        console.log('Token verified successfully:', tokenData);

        // Create an unauthenticated client for public access
        const publicSupabase = supabase;

        // Fetch products with public access
        const { data: productsData, error: productsError } = await publicSupabase
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
          // Try alternative approach - fetch without relation
          const { data: simpleProductsData, error: simpleProductsError } = await publicSupabase
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

        const { data: categoriesData, error: categoriesError } = await publicSupabase
          .from('product_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          // Continue without categories
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
  }, [token]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat katalog produk...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Katalog Produk</h1>
            <p className="text-gray-600 mt-1">Daftar harga khusus reseller</p>
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
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
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
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
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
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">
                  Menampilkan {filteredProducts.length} produk
                </Badge>
                {searchTerm && (
                  <Badge variant="outline">
                    Pencarian: "{searchTerm}"
                  </Badge>
                )}
                {categoryFilter !== 'all' && (
                  <Badge variant="outline">
                    Kategori: {categories.find(c => c.id === categoryFilter)?.name}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductListItem key={product.id} product={product} />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Tidak ada produk yang sesuai filter' 
                  : 'Belum ada produk'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Coba ubah kriteria pencarian atau filter Anda'
                  : 'Produk akan ditampilkan di sini'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = product.reseller_price || product.price;

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
            <h3 className="font-semibold line-clamp-2">{product.name}</h3>
            {product.product_categories && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {product.product_categories.name}
              </Badge>
            )}
          </div>
          
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xl font-bold text-blue-600">
                {formatPrice(displayPrice)}
              </p>
              {product.reseller_price && (
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

const ProductListItem = ({ product }: { product: Product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = product.reseller_price || product.price;

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
                <h3 className="font-semibold">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                )}
                {product.product_categories && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {product.product_categories.name}
                  </Badge>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">
                  {formatPrice(displayPrice)}
                </p>
                {product.reseller_price && (
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

export default PublicCatalog;
