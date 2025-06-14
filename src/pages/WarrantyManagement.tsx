
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Truck, 
  ShoppingBag, 
  Shield, 
  AlertTriangle,
  FileText,
  Plus,
  Search
} from 'lucide-react';
import WarrantyProductsTab from '@/components/Warranty/WarrantyProductsTab';
import WarrantySuppliersTab from '@/components/Warranty/WarrantySuppliersTab';
import WarrantySalesTab from '@/components/Warranty/WarrantySalesTab';
import WarrantyClaimsTab from '@/components/Warranty/WarrantyClaimsTab';
import WarrantyReportsTab from '@/components/Warranty/WarrantyReportsTab';
import { useWarrantyProducts, useWarrantySales, useWarrantyClaims } from '@/hooks/useWarranty';

const WarrantyManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  
  const { data: products } = useWarrantyProducts();
  const { data: sales } = useWarrantySales();
  const { data: claims } = useWarrantyClaims();

  const stats = {
    totalProducts: products?.length || 0,
    inStock: products?.filter(p => p.status === 'in_stock').length || 0,
    sold: products?.filter(p => p.status === 'sold').length || 0,
    activeClaims: claims?.filter(c => c.status === 'processing').length || 0,
    expiringSoon: sales?.filter(s => {
      const daysUntilExpiry = Math.ceil((new Date(s.customer_warranty_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length || 0
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Garansi Produk</h1>
        <p className="text-gray-600">Kelola garansi produk dari supplier hingga klaim pelanggan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Stok Tersedia</p>
                <p className="text-2xl font-bold">{stats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Terjual</p>
                <p className="text-2xl font-bold">{stats.sold}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Klaim Aktif</p>
                <p className="text-2xl font-bold">{stats.activeClaims}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Akan Expired</p>
                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="products">Barang Masuk</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier</TabsTrigger>
          <TabsTrigger value="sales">Barang Terjual</TabsTrigger>
          <TabsTrigger value="claims">Klaim Garansi</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <WarrantyProductsTab />
        </TabsContent>
        
        <TabsContent value="suppliers">
          <WarrantySuppliersTab />
        </TabsContent>
        
        <TabsContent value="sales">
          <WarrantySalesTab />
        </TabsContent>
        
        <TabsContent value="claims">
          <WarrantyClaimsTab />
        </TabsContent>
        
        <TabsContent value="reports">
          <WarrantyReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarrantyManagement;
