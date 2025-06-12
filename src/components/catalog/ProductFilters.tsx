
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductCategory } from '@/types/product';

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: ProductCategory[] | undefined;
  filteredProductsCount: number;
}

const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  categories,
  filteredProductsCount
}: ProductFiltersProps) => {
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
          <Filter className="h-4 w-4 md:h-5 md:w-5" />
          <span>Filter & Pencarian</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama produk atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            size="sm"
            className="w-full md:w-auto"
          >
            Reset Filter
          </Button>
          
          <div className="flex flex-wrap gap-2 mt-2 md:mt-4">
            <Badge variant="secondary" className="text-xs">
              Menampilkan {filteredProductsCount} produk
            </Badge>
            {searchTerm && (
              <Badge variant="outline" className="text-xs">
                Pencarian: "{searchTerm}"
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="outline" className="text-xs">
                Kategori: {categories?.find(c => c.id === categoryFilter)?.name}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;
