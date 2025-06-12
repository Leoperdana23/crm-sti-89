import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Package, CheckCircle, User, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/product';
import { useResellerAuth } from '@/hooks/useResellerAuth';
import CheckoutDialog from '@/components/CheckoutDialog';
import SearchAndFilter from '@/components/catalog/SearchAndFilter';
import ProductGrid from '@/components/catalog/ProductGrid';
import CartButton from '@/components/catalog/CartButton';

const PRODUCTS_PER_PAGE = 20;

// Cart item type
interface CartItem {
  product: Product;
  quantity: number;
}

const PublicCatalog = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { session, clearResellerSession } = useResellerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchCatalogData = async () => {
      if (!token) {
        setError('Token tidak valid');
        setIsLoading(false);
        return;
      }

      // Check if reseller is logged in
      if (!session) {
        setError('Silakan login sebagai reseller untuk mengakses katalog');
        setIsLoading(false);
        return;
      }

      // Verify if the token matches the logged-in reseller's token
      if (session.catalogToken !== token) {
        setError('Token tidak sesuai dengan sesi reseller yang login');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Verifying token:', token);
        
        // Verify token exists and is active (no expiry check since tokens are now unlimited)
        const { data: tokenData, error: tokenError } = await supabase
          .from('catalog_tokens')
          .select('*')
          .eq('token', token)
          .eq('is_active', true)
          .single();

        if (tokenError || !tokenData) {
          console.error('Token verification failed:', tokenError);
          setError('Token tidak valid atau tidak aktif');
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
  }, [token, session]);

  const handleLogout = () => {
    clearResellerSession();
    navigate('/reseller-login');
  };

  const handleLogin = () => {
    navigate('/reseller-login');
  };

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

  const handleOrderSuccess = () => {
    setCart([]);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

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
            <p className="text-gray-600 mb-4">{error}</p>
            {!session && (
              <Button onClick={handleLogin} className="bg-green-600 hover:bg-green-700">
                Login Reseller
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="w-full max-w-sm mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">Katalog Produk</h1>
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-2">
              {session ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{session.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLogout}
                    className="flex items-center gap-1"
                  >
                    <LogOut className="h-3 w-3" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleLogin}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto px-3 py-3 space-y-3">
        {/* Order Success Message */}
        {orderSuccess && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 text-sm font-medium">Pesanan berhasil dibuat!</span>
          </div>
        )}

        {/* Search and Filter */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          categoryFilter={categoryFilter}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categories={categories}
        />

        {/* Product Grid */}
        <ProductGrid
          products={paginatedProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          getProductQuantity={getProductQuantity}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onResetSearch={handleResetSearch}
          hasFilters={hasFilters}
        />
      </div>

      {/* Fixed Cart Button */}
      <CartButton
        cart={cart}
        totalItems={getTotalItems()}
        totalPrice={getTotalPrice()}
        onClick={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Dialog */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        catalogToken={token || ''}
        resellerSession={session}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
};

export default PublicCatalog;
