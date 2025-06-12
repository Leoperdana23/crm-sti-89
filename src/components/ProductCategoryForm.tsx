
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Package } from 'lucide-react';
import { useCreateProductCategory, useUpdateProductCategory } from '@/hooks/useProductCategories';
import { ProductCategory } from '@/types/product';

interface ProductCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ProductCategory;
}

const ProductCategoryForm = ({ isOpen, onClose, category }: ProductCategoryFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createCategoryMutation = useCreateProductCategory();
  const updateCategoryMutation = useUpdateProductCategory();

  const isEditing = !!category;
  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  useEffect(() => {
    if (isOpen && category) {
      setName(category.name);
      setDescription(category.description || '');
    } else if (isOpen && !category) {
      setName('');
      setDescription('');
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    try {
      if (isEditing && category) {
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await createCategoryMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }
      
      onClose();
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing ? 'Edit Kategori Produk' : 'Tambah Kategori Produk'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Nama Kategori *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama kategori"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Deskripsi (Opsional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi kategori"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditing ? 'Memperbarui...' : 'Menyimpan...'}
                </>
              ) : (
                isEditing ? 'Perbarui' : 'Simpan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductCategoryForm;
