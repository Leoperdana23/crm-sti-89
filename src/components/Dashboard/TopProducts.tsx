
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const TopProducts = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terlaris</CardTitle>
      </CardHeader>
      <CardContent>
        {stats?.top_products && stats.top_products.length > 0 ? (
          <div className="space-y-4">
            {stats.top_products.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                </div>
                <Package className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.sales_count} terjual • {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada data penjualan produk</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopProducts;
