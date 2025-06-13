
import React, { useState } from 'react';
import { Plus, Grid, List, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryManagement from './CategoryManagement';

interface ProductActionsProps {
  canManageProducts: boolean;
  setProductFormOpen: (open: boolean) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const ProductActions = ({
  canManageProducts,
  setProductFormOpen,
  viewMode,
  setViewMode
}: ProductActionsProps) => {
  const [categoryManagementOpen, setCategoryManagementOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {canManageProducts && (
          <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:flex-none">
            <Button 
              onClick={() => setCategoryManagementOpen(true)} 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Tags className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Kelola Kategori</span>
              <span className="sm:hidden">Kategori</span>
            </Button>
            
            <Button 
              onClick={() => setProductFormOpen(true)} 
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tambah Produk</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        )}
        
        <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-0">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex-1 sm:flex-none"
          >
            <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="ml-1 sm:hidden">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex-1 sm:flex-none"
          >
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="ml-1 sm:hidden">List</span>
          </Button>
        </div>
      </div>

      <Dialog open={categoryManagementOpen} onOpenChange={setCategoryManagementOpen}>
        <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Kelola Kategori Produk</DialogTitle>
          </DialogHeader>
          <CategoryManagement />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductActions;
