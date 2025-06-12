
import React, { useState } from 'react';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useProductCategories, useDeleteProductCategory } from '@/hooks/useProductCategories';
import { ProductCategory } from '@/types/product';
import ProductCategoryForm from '@/components/ProductCategoryForm';

const ProductCategories = () => {
  const { data: categories, isLoading } = useProductCategories();
  const deleteProductCategoryMutation = useDeleteProductCategory();
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | undefined>();

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteProductCategoryMutation.mutateAsync(categoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCloseCategoryForm = () => {
    setCategoryFormOpen(false);
    setEditingCategory(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat kategori produk...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori Produk</h1>
          <p className="text-gray-600 mt-1">
            Kelola kategori untuk mengorganisir produk
          </p>
        </div>
        
        <Button onClick={() => setCategoryFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="truncate">{category.name}</span>
                </div>
                <Badge variant="secondary">
                  Aktif
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-gray-500">
                  Dibuat: {new Date(category.created_at).toLocaleDateString('id-ID')}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus kategori "{category.name}"? 
                          Kategori ini akan dinonaktifkan dan tidak dapat digunakan untuk produk baru.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada kategori
            </h3>
            <p className="text-gray-600 mb-4">
              Tambahkan kategori untuk mengorganisir produk Anda
            </p>
            <Button onClick={() => setCategoryFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Category Form Modal */}
      <ProductCategoryForm 
        isOpen={categoryFormOpen}
        onClose={handleCloseCategoryForm}
        category={editingCategory}
      />
    </div>
  );
};

export default ProductCategories;
