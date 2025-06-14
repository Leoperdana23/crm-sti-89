
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Gift } from 'lucide-react';
import CategoryManagement from '@/components/catalog/CategoryManagement';
import RewardManagement from '@/components/catalog/RewardManagement';

const CatalogManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Katalog</h1>
        <p className="text-gray-600">Kelola kategori produk dan hadiah reward</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Kategori Produk
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Hadiah Reward
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>

        <TabsContent value="rewards">
          <RewardManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatalogManagement;
