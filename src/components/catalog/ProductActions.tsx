
import React, { useState } from 'react';
import { Plus, Link, Grid, List, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryManagement from './CategoryManagement';

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
  const [categoryManagementOpen, setCategoryManagementOpen] = useState(false);

  return (
    <>
      <div className="flex items-center space-x-2">
        {canManageProducts && (
          <>
            <Button onClick={() => setTokenManagerOpen(true)} variant="outline" size="sm">
              <Link className="h-4 w-4 mr-2" />
              Link Publik
            </Button>
            <Button onClick={() => setCategoryManagementOpen(true)} variant="outline" size="sm">
              <Tags className="h-4 w-4 mr-2" />
              Kelola Kategori
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

      <Dialog open={categoryManagementOpen} onOpenChange={setCategoryManagementOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Kategori Produk</DialogTitle>
          </DialogHeader>
          <CategoryManagement />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductActions;
