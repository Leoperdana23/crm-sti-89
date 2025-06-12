
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const OrdersErrorState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md">
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat</h3>
          <p className="text-gray-600">Terjadi kesalahan saat memuat daftar pesanan</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersErrorState;
