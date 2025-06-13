
import React from 'react';
import { Search } from 'lucide-react';

const CatalogHeader = () => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="w-full max-w-7xl mx-auto px-3 py-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Katalog Produk</h1>
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogHeader;
