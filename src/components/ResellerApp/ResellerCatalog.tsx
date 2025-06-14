import React, { useState, useEffect } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, Search, Plus, Minus, ShoppingCart, Loader2, Award, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ResellerCatalogProps {
  reseller: ResellerSession;
}

const ResellerCatalog: React.FC<ResellerCatalogProps> = ({ reseller }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceType, setPriceType] = useState<'retail' | 'reseller'>('reseller');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>('');
  
  // Form state
  const [orderForm, setOrderForm] = useState({
    customerName: reseller.name,
    customerPhone: reseller.phone,
    shippingAddress: reseller.address,
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    expedisi: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
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

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) throw categoriesError;

      // Transform products data to match Product type
      const transformedProducts = productsData?.map(product => ({
        ...product,
        product_categories: product.product_categories ? {
          name: product.product_categories.name
        } : undefined
      })) || [];

      setProducts(transformedProducts);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data produk',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const getDisplayPrice = (product: Product) => {
    if (priceType === 'reseller' && product.reseller_price) {
      return product.reseller_price;
    }
    return product.price;
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleQuantityClick = (productId: string, currentQuantity: number) => {
    setEditingQuantity(productId);
    setTempQuantity(currentQuantity.toString());
  };

  const handleQuantitySubmit = (productId: string) => {
    const newQuantity = parseInt(tempQuantity) || 0;
    updateQuantity(productId, newQuantity);
    setEditingQuantity(null);
    setTempQuantity('');
  };

  const handleQuantityKeyPress = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit(productId);
    } else if (e.key === 'Escape') {
      setEditingQuantity(null);
      setTempQuantity('');
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      const price = priceType === 'reseller' && item.product.reseller_price 
        ? item.product.reseller_price 
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItem = (productId: string) => {
    return cart.find(item => item.product.id === productId);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    try {
      setSubmittingOrder(true);

      // Create order with reseller token
      const orderData = {
        customer_name: reseller.name,
        customer_phone: reseller.phone,
        catalog_token: reseller.token,
        total_amount: getTotalAmount(),
        delivery_method: orderForm.deliveryMethod,
        expedisi: orderForm.deliveryMethod === 'delivery' ? orderForm.expedisi : null,
        shipping_address: orderForm.shippingAddress,
        notes: orderForm.notes || null
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: priceType === 'reseller' && item.product.reseller_price 
          ? item.product.reseller_price 
          : item.product.price,
        quantity: item.quantity,
        subtotal: (priceType === 'reseller' && item.product.reseller_price 
          ? item.product.reseller_price 
          : item.product.price) * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create reseller order record for commission tracking
      const { error: resellerOrderError } = await supabase
        .from('reseller_orders')
        .insert({
          order_id: order.id,
          reseller_id: reseller.id,
          commission_rate: reseller.commission_rate,
          commission_amount: (getTotalAmount() * reseller.commission_rate) / 100,
          status: 'pending'
        });

      if (resellerOrderError) throw resellerOrderError;

      toast({
        title: 'Sukses',
        description: 'Pesanan berhasil dibuat dan akan diproses',
      });

      // Reset form and cart
      setCart([]);
      setOrderForm({
        customerName: reseller.name,
        customerPhone: reseller.phone,
        shippingAddress: reseller.address,
        deliveryMethod: 'pickup',
        expedisi: '',
        notes: ''
      });
      setShowOrderForm(false);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat pesanan',
        variant: 'destructive',
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Katalog Produk</h2>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kategori" />
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

          <Select value={priceType} onValueChange={(value: 'retail' | 'reseller') => setPriceType(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reseller">Harga Reseller</SelectItem>
              <SelectItem value="retail">Harga Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Produk</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Tidak ada produk yang sesuai dengan filter' 
                : 'Belum ada produk tersedia'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const cartItem = getCartItem(product.id);
            const displayPrice = getDisplayPrice(product);
            const originalPrice = product.price;
            
            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-2">
                          <h3 className="font-semibold text-sm md:text-lg text-gray-900">{product.name}</h3>
                          
                          {/* Points and Commission - Mobile friendly */}
                          <div className="flex gap-3 mt-1">
                            {product.points_value && product.points_value > 0 && (
                              <div className="flex items-center gap-1">
                                <Award className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-yellow-600">{product.points_value} poin</span>
                              </div>
                            )}
                            {product.commission_value && product.commission_value > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600">{formatPrice(product.commission_value)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {/* Quantity Controls */}
                          {cartItem ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              {editingQuantity === product.id ? (
                                <Input
                                  value={tempQuantity}
                                  onChange={(e) => setTempQuantity(e.target.value)}
                                  onBlur={() => handleQuantitySubmit(product.id)}
                                  onKeyDown={(e) => handleQuantityKeyPress(e, product.id)}
                                  className="w-16 h-8 text-center p-1"
                                  type="number"
                                  min="1"
                                  autoFocus
                                />
                              ) : (
                                <span 
                                  className="w-8 text-center font-medium cursor-pointer hover:bg-gray-100 rounded px-1"
                                  onClick={() => handleQuantityClick(product.id, cartItem.quantity)}
                                >
                                  {cartItem.quantity}
                                </span>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Tambah
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Price Information */}
                      <div className="mb-3">
                        <div className="text-lg md:text-xl font-bold text-gray-900">
                          {formatPrice(displayPrice)}
                        </div>
                        {priceType === 'reseller' && product.reseller_price && product.reseller_price < originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(originalPrice)}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">per {product.unit}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <span className="font-medium">
                {getTotalItems()} item - {formatPrice(getTotalAmount())}
              </span>
            </div>
            <Button
              onClick={() => setShowOrderForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Order Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Pemesanan</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Ringkasan Pesanan</h4>
              <div className="space-y-1 text-sm">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{formatPrice((priceType === 'reseller' && item.product.reseller_price ? item.product.reseller_price : item.product.price) * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-1 font-medium flex justify-between">
                  <span>Total:</span>
                  <span>{formatPrice(getTotalAmount())}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="customerName">Nama Pemesan</Label>
                <Input
                  id="customerName"
                  value={orderForm.customerName}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">No. Telepon</Label>
                <Input
                  id="customerPhone"
                  value={orderForm.customerPhone}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="shippingAddress">Alamat Pengiriman</Label>
                <Textarea
                  id="shippingAddress"
                  value={orderForm.shippingAddress}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                  placeholder="Alamat lengkap"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="deliveryMethod">Jenis Pengiriman</Label>
                <Select 
                  value={orderForm.deliveryMethod} 
                  onValueChange={(value: 'pickup' | 'delivery') => setOrderForm(prev => ({ ...prev, deliveryMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Diambil</SelectItem>
                    <SelectItem value="delivery">Dikirim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderForm.deliveryMethod === 'delivery' && (
                <div>
                  <Label htmlFor="expedisi">Expedisi</Label>
                  <Input
                    id="expedisi"
                    value={orderForm.expedisi}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, expedisi: e.target.value }))}
                    placeholder="JNE, TIKI, J&T, dll"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan tambahan untuk pesanan"
                  rows={2}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowOrderForm(false)}
                disabled={submittingOrder}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmitOrder}
                disabled={submittingOrder}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  'Buat Pesanan'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResellerCatalog;
