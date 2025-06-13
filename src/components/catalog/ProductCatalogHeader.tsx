
import React from 'react';
import { Plus, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCatalogHeaderProps {
  canManageProducts: boolean;
  onAddProduct: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const ProductCatalogHeader = ({
  canManageProducts,
  onAddProduct,
  viewMode,
  onViewModeChange
}: ProductCatalogHeaderProps) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Katalog Produk
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Kelola dan atur produk Anda dengan mudah
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* View Mode Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none border-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Add Product Button */}
            {canManageProducts && (
              <Button onClick={onAddProduct} size="sm" className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Tambah Produk</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCatalogHeader;
