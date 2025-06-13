
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onResetSearch: () => void;
  hasFilters: boolean;
}

const EmptyState = ({ onResetSearch, hasFilters }: EmptyStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-8 md:py-12">
        <Package className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
          {hasFilters 
            ? 'Tidak ada produk yang sesuai filter' 
            : 'Belum ada produk'}
        </h3>
        <p className="text-sm md:text-base text-gray-600 mb-4">
          {hasFilters
            ? 'Coba ubah kriteria pencarian atau filter Anda'
            : 'Produk akan ditampilkan di sini'}
        </p>
        {hasFilters && (
          <Button onClick={onResetSearch} variant="outline">
            Reset Filter
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
