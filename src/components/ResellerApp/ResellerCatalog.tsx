
import React, { useState } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useProducts } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, ShoppingCart, Eye } from 'lucide-react';

interface ResellerCatalogProps {
  reseller: ResellerSession;
}

const ResellerCatalog: React.FC<ResellerCatalogProps> = ({ reseller }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceView, setPriceView] = useState<'reseller' | 'public'>('reseller');

  const { products, loading: productsLoading } = useProducts();
  const { categories } = useProductCategories();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory && product.is_active;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProductPrice = (product: any) => {
    if (priceView === 'reseller' && product.reseller_price) {
      return product.reseller_price;
    }
    return product.price;
  };

  const handleOrderProduct = (productId: string) => {
    // Navigate to order form or handle order logic
    console.log('Order product:', productId);
  };

  const handleViewDetails = (productId: string) => {
    // Navigate to product details or show modal
    console.log('View product details:', productId);
  };

  if (productsLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-32 w-full mb-4 rounded" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Katalog Produk</h2>
        <div className="flex gap-2">
          <Button
            variant={priceView === 'reseller' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriceView('reseller')}
          >
            Harga Reseller
          </Button>
          <Button
            variant={priceView === 'public' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPriceView('public')}
          >
            Harga Umum
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
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
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
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
                <div className="flex-1 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    {product.featured && (
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(getProductPrice(product))}
                      </div>
                      {priceView === 'reseller' && product.reseller_price && product.reseller_price !== product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(product.id)}
                        className="p-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOrderProduct(product.id)}
                        className="p-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Tidak ada produk yang ditemukan</p>
        </div>
      )}
    </div>
  );
};

export default ResellerCatalog;
