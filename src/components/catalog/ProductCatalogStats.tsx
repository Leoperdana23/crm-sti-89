
import React from 'react';
import { Package, CheckCircle, AlertTriangle, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Product, ProductCategory } from '@/types/product';

interface ProductCatalogStatsProps {
  products: Product[];
  categories: ProductCategory[];
}

const ProductCatalogStats = ({ products, categories }: ProductCatalogStatsProps) => {
  const activeProducts = products.filter(p => p.is_active).length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.min_stock_level).length;

  const stats = [
    {
      title: 'Total Produk',
      value: products.length,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Produk Aktif',
      value: activeProducts,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Stok Rendah',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      title: 'Kategori',
      value: categories.length,
      icon: FolderOpen,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductCatalogStats;
