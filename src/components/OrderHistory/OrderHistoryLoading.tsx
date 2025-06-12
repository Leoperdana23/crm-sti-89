
import React from 'react';
import { Loader2 } from 'lucide-react';

const OrderHistoryLoading = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-green-500" />
        <span className="text-gray-700">Memuat history pesanan...</span>
      </div>
    </div>
  );
};

export default OrderHistoryLoading;
