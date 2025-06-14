
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2, Download } from 'lucide-react';
import { useCreateBulkWarrantyProducts, useWarrantySuppliers } from '@/hooks/useWarranty';

interface BulkProductImportProps {
  onClose: () => void;
}

interface ProductEntry {
  product_name: string;
  serial_number: string;
  supplier_id: string;
  received_date: string;
  warranty_months: number;
  warranty_start_date: string;
  status: 'in_stock' | 'sold' | 'damaged' | 'returned';
  notes: string;
}

const BulkProductImport: React.FC<BulkProductImportProps> = ({ onClose }) => {
  const { data: suppliers } = useWarrantySuppliers();
  const createBulkProducts = useCreateBulkWarrantyProducts();
  
  const [products, setProducts] = useState<ProductEntry[]>([
    {
      product_name: '',
      serial_number: '',
      supplier_id: '',
      received_date: new Date().toISOString().split('T')[0],
      warranty_months: 12,
      warranty_start_date: new Date().toISOString().split('T')[0],
      status: 'in_stock',
      notes: ''
    }
  ]);

  const addProduct = () => {
    setProducts([...products, {
      product_name: '',
      serial_number: '',
      supplier_id: '',
      received_date: new Date().toISOString().split('T')[0],
      warranty_months: 12,
      warranty_start_date: new Date().toISOString().split('T')[0],
      status: 'in_stock',
      notes: ''
    }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ProductEntry, value: any) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-set warranty months when supplier changes
    if (field === 'supplier_id' && suppliers) {
      const supplier = suppliers.find(s => s.id === value);
      if (supplier) {
        updated[index].warranty_months = supplier.default_warranty_months;
      }
    }
    
    setProducts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all products
    const validProducts = products.filter(p => 
      p.product_name && p.serial_number && p.warranty_months > 0
    );
    
    if (validProducts.length === 0) {
      alert('Minimal satu produk harus diisi dengan lengkap');
      return;
    }
    
    try {
      await createBulkProducts.mutateAsync(validProducts);
      onClose();
    } catch (error) {
      console.error('Error creating bulk products:', error);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Nama Barang,Serial Number,Supplier,Tanggal Masuk,Masa Garansi (Bulan),Garansi Mulai,Status,Catatan\n" +
      "Contoh Produk,SN001,Supplier A,2024-01-01,12,2024-01-01,in_stock,Catatan contoh";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_bulk_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Import Produk Secara Bulk</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {products.map((product, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Produk #{index + 1}</h4>
                      {products.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Nama Barang *</Label>
                        <Input
                          value={product.product_name}
                          onChange={(e) => updateProduct(index, 'product_name', e.target.value)}
                          placeholder="Masukkan nama barang"
                        />
                      </div>
                      
                      <div>
                        <Label>Serial Number *</Label>
                        <Input
                          value={product.serial_number}
                          onChange={(e) => updateProduct(index, 'serial_number', e.target.value)}
                          placeholder="Masukkan serial number"
                        />
                      </div>
                      
                      <div>
                        <Label>Supplier</Label>
                        <Select 
                          value={product.supplier_id} 
                          onValueChange={(value) => updateProduct(index, 'supplier_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers?.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Tanggal Masuk *</Label>
                        <Input
                          type="date"
                          value={product.received_date}
                          onChange={(e) => updateProduct(index, 'received_date', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Masa Garansi (Bulan) *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={product.warranty_months}
                          onChange={(e) => updateProduct(index, 'warranty_months', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Garansi Mulai *</Label>
                        <Input
                          type="date"
                          value={product.warranty_start_date}
                          onChange={(e) => updateProduct(index, 'warranty_start_date', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Status</Label>
                        <Select 
                          value={product.status} 
                          onValueChange={(value) => updateProduct(index, 'status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in_stock">Stok</SelectItem>
                            <SelectItem value="sold">Terjual</SelectItem>
                            <SelectItem value="damaged">Rusak</SelectItem>
                            <SelectItem value="returned">Dikembalikan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Catatan</Label>
                        <Input
                          value={product.notes}
                          onChange={(e) => updateProduct(index, 'notes', e.target.value)}
                          placeholder="Catatan (opsional)"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={addProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk Lagi
              </Button>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit" disabled={createBulkProducts.isPending}>
                  {createBulkProducts.isPending ? 'Menyimpan...' : `Simpan ${products.length} Produk`}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkProductImport;
