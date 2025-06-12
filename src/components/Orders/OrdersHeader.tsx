
import React from 'react';
import { Package } from 'lucide-react';

const OrdersHeader = () => {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Pesanan</h1>
            <p className="text-gray-600 mt-1">Kelola semua pesanan dari katalog publik</p>
          </div>
          <Package className="h-8 w-8 text-green-500" />
        </div>
      </div>
    </div>
  );
};

export default OrdersHeader;
