
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  searchTerm: string;
  categoryFilter: string;
}

const EmptyState = ({ searchTerm, categoryFilter }: EmptyStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-8 md:py-12">
        <Package className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
          {searchTerm || categoryFilter !== 'all' 
            ? 'Tidak ada produk yang sesuai filter' 
            : 'Belum ada produk'}
        </h3>
        <p className="text-sm md:text-base text-gray-600">
          {searchTerm || categoryFilter !== 'all'
            ? 'Coba ubah kriteria pencarian atau filter Anda'
            : 'Produk akan ditampilkan di sini'}
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
