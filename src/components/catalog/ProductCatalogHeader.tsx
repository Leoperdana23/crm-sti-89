
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
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Katalog Produk
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola dan atur produk Anda dengan mudah
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Add Product Button */}
            {canManageProducts && (
              <Button onClick={onAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCatalogHeader;
