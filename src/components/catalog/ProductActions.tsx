
import React from 'react';
import { Plus, Link, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductActionsProps {
  canManageProducts: boolean;
  setTokenManagerOpen: (open: boolean) => void;
  setProductFormOpen: (open: boolean) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const ProductActions = ({
  canManageProducts,
  setTokenManagerOpen,
  setProductFormOpen,
  viewMode,
  setViewMode
}: ProductActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      {canManageProducts && (
        <>
          <Button onClick={() => setTokenManagerOpen(true)} variant="outline" size="sm">
            <Link className="h-4 w-4 mr-2" />
            Link Publik
          </Button>
          <Button onClick={() => setProductFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </>
      )}
      
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('grid')}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setViewMode('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductActions;
