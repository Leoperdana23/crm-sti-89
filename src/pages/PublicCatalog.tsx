import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, Package, Grid, List, SlidersHorizontal, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/product';

const PRODUCTS_PER_PAGE = 20;

// Cart item type
interface CartItem {
  product: Product;
  quantity: number;
}

const PublicCatalog = () => {
  const { token } = useParams<{ token: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);

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
  }, [token]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      return prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      ).filter(item => item.quantity > 0);
    });
  };

  const getProductQuantity = (productId: string) => {
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = item.product.reseller_price || item.product.price;
      return total + (price * item.quantity);
    }, 0);
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
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          <span className="text-gray-700">Memuat katalog produk...</span>
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
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Katalog Produk</h1>
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Search and Filter Bar */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari makanan atau minuman"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Select value={categoryFilter} onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-32 shrink-0">
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 shrink-0">
                    <SelectValue placeholder="Nama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nama</SelectItem>
                    <SelectItem value="price-low">Harga Terendah</SelectItem>
                    <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product List */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedProducts.map((product) => (
                <ProductListItem 
                  key={product.id} 
                  product={product} 
                  quantity={getProductQuantity(product.id)}
                  onAdd={() => addToCart(product)}
                  onRemove={() => removeFromCart(product.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <Card className="shadow-sm border-0">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Produk tidak ditemukan' 
                  : 'Belum ada produk'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Coba ubah kata kunci atau filter pencarian Anda'
                  : 'Produk akan segera ditambahkan'}
              </p>
              {(searchTerm || categoryFilter !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setCurrentPage(1);
                  }}
                  variant="outline"
                  className="border-green-200 text-green-600 hover:bg-green-50"
                >
                  Reset Pencarian
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fixed Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-green-600 text-white rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-700 rounded-full p-2">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {getTotalItems()} item
                </div>
                <div className="text-xs opacity-90 truncate max-w-32">
                  {cart.map(item => item.product.name).join(', ')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">
                {formatPrice(getTotalPrice())}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductListItemProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductListItem = ({ product, quantity, onAdd, onRemove }: ProductListItemProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayPrice = product.reseller_price || product.price;
  const hasDiscount = product.reseller_price && product.reseller_price < product.price;
  const categoryName = product.product_categories?.name || 'Uncategorized';

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                  {product.name}
                </h3>
                
                {/* Category */}
                <p className="text-sm text-gray-500 mb-2">
                  {categoryName}
                </p>

                {/* Price */}
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              
              {/* Add/Remove Controls */}
              <div className="flex flex-col items-end justify-center h-full">
                {quantity === 0 ? (
                  <Button
                    onClick={onAdd}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm h-9"
                  >
                    +
                  </Button>
                ) : (
                  <div className="flex items-center bg-green-600 rounded-lg overflow-hidden">
                    <Button
                      size="sm"
                      onClick={onRemove}
                      className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 p-0 rounded-none"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-white font-semibold px-3 py-2 bg-green-600 text-sm min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <Button
                      size="sm"
                      onClick={onAdd}
                      className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 p-0 rounded-none"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicCatalog;
