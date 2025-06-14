
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const WarrantySalesTab = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Barang Terjual</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Catat Penjualan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Tab Barang Terjual sedang dalam pengembangan...</p>
      </CardContent>
    </Card>
  );
};

export default WarrantySalesTab;
