
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useCreateWarrantyProduct, useWarrantySuppliers } from '@/hooks/useWarranty';
import type { WarrantyProduct } from '@/types/warranty';

interface WarrantyProductFormProps {
  product?: WarrantyProduct | null;
  onClose: () => void;
}

const WarrantyProductForm: React.FC<WarrantyProductFormProps> = ({ product, onClose }) => {
  const { data: suppliers } = useWarrantySuppliers();
  const createProduct = useCreateWarrantyProduct();
  
  const [formData, setFormData] = useState({
    product_name: '',
    serial_number: '',
    supplier_id: '',
    received_date: new Date().toISOString().split('T')[0],
    supplier_invoice_date: '',
    warranty_months: 12,
    warranty_start_date: new Date().toISOString().split('T')[0],
    status: 'in_stock' as const,
    notes: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name,
        serial_number: product.serial_number,
        supplier_id: product.supplier_id || '',
        received_date: product.received_date,
        supplier_invoice_date: product.supplier_invoice_date || '',
        warranty_months: product.warranty_months,
        warranty_start_date: product.warranty_start_date,
        status: product.status,
        notes: product.notes || ''
      });
    }
  }, [product]);

  // Auto-set warranty months when supplier changes
  useEffect(() => {
    if (formData.supplier_id && suppliers) {
      const supplier = suppliers.find(s => s.id === formData.supplier_id);
      if (supplier) {
        setFormData(prev => ({
          ...prev,
          warranty_months: supplier.default_warranty_months
        }));
      }
    }
  }, [formData.supplier_id, suppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProduct.mutateAsync(formData);
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{product ? 'Edit Produk' : 'Tambah Produk Baru'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_name">Nama Barang *</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => handleChange('product_name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => handleChange('serial_number', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="supplier_id">Supplier</Label>
                <Select 
                  value={formData.supplier_id} 
                  onValueChange={(value) => handleChange('supplier_id', value)}
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
                <Label htmlFor="received_date">Tanggal Masuk *</Label>
                <Input
                  id="received_date"
                  type="date"
                  value={formData.received_date}
                  onChange={(e) => handleChange('received_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="supplier_invoice_date">Tanggal Invoice Supplier</Label>
                <Input
                  id="supplier_invoice_date"
                  type="date"
                  value={formData.supplier_invoice_date}
                  onChange={(e) => handleChange('supplier_invoice_date', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="warranty_months">Masa Garansi (Bulan) *</Label>
                <Input
                  id="warranty_months"
                  type="number"
                  min="1"
                  value={formData.warranty_months}
                  onChange={(e) => handleChange('warranty_months', parseInt(e.target.value))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="warranty_start_date">Garansi Mulai *</Label>
                <Input
                  id="warranty_start_date"
                  type="date"
                  value={formData.warranty_start_date}
                  onChange={(e) => handleChange('warranty_start_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleChange('status', value)}
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
            </div>
            
            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarrantyProductForm;
