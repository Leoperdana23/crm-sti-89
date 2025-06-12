
import React, { useState } from 'react';
import { Edit, Trash2, Plus, Package } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useProductCategories, useDeleteProductCategory } from '@/hooks/useProductCategories';
import { ProductCategory } from '@/types/product';
import ProductCategoryForm from '@/components/ProductCategoryForm';

const CategoryManagement = () => {
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

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setCategoryFormOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-gray-500">Memuat kategori...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Kelola Kategori Produk
            </CardTitle>
            <Button onClick={handleAddCategory} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-gray-600">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada kategori
              </h3>
              <p className="text-gray-600 mb-4">
                Tambahkan kategori untuk mengorganisir produk Anda
              </p>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kategori Pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductCategoryForm 
        isOpen={categoryFormOpen}
        onClose={handleCloseCategoryForm}
        category={editingCategory}
      />
    </>
  );
};

export default CategoryManagement;
