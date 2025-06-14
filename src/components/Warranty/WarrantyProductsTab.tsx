
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Search, Package, Upload } from 'lucide-react';
import { useWarrantyProducts } from '@/hooks/useWarranty';
import WarrantyProductForm from './WarrantyProductForm';
import BulkProductImport from './BulkProductImport';

const WarrantyProductsTab = () => {
  const { data: products, isLoading } = useWarrantyProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'Stok';
      case 'sold': return 'Terjual';
      case 'damaged': return 'Rusak';
      case 'returned': return 'Dikembalikan';
      default: return status;
    }
  };

  const filteredProducts = products?.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Barang Masuk dari Supplier
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowBulkImport(true)} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Bulk
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Barang
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari nama barang, serial number, atau supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Masa Garansi</TableHead>
                <TableHead>Berakhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.product_name}</TableCell>
                  <TableCell className="font-mono text-sm">{product.serial_number}</TableCell>
                  <TableCell>{product.supplier?.name || '-'}</TableCell>
                  <TableCell>{formatDate(product.received_date)}</TableCell>
                  <TableCell>{product.warranty_months} bulan</TableCell>
                  <TableCell>{formatDate(product.warranty_end_date)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {getStatusLabel(product.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Forms */}
      {showForm && (
        <WarrantyProductForm
          product={selectedProduct}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showBulkImport && (
        <BulkProductImport
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  );
};

export default WarrantyProductsTab;
