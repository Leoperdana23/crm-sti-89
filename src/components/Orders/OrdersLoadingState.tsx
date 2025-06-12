
import React from 'react';
import { Loader2 } from 'lucide-react';

const OrdersLoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-green-500" />
        <span className="text-gray-700">Memuat daftar pesanan...</span>
      </div>
    </div>
  );
};

export default OrdersLoadingState;
