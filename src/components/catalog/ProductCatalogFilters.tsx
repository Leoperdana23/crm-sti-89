
import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCategory } from '@/types/product';

interface ProductCatalogFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categories: ProductCategory[];
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const ProductCatalogFilters = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
  onResetFilters,
  filteredCount,
  totalCount
}: ProductCatalogFiltersProps) => {
  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || sortBy !== 'name';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nama A-Z</SelectItem>
                <SelectItem value="price-low">Harga: Rendah ke Tinggi</SelectItem>
                <SelectItem value="price-high">Harga: Tinggi ke Rendah</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Status and Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                Menampilkan {filteredCount} dari {totalCount} produk
              </Badge>
              
              {searchTerm && (
                <Badge variant="secondary">
                  Pencarian: "{searchTerm}"
                </Badge>
              )}
              
              {categoryFilter !== 'all' && (
                <Badge variant="secondary">
                  Kategori: {categories.find(c => c.id === categoryFilter)?.name}
                </Badge>
              )}
              
              {sortBy !== 'name' && (
                <Badge variant="secondary">
                  Urutan: {sortBy === 'price-low' ? 'Harga Rendah' : sortBy === 'price-high' ? 'Harga Tinggi' : sortBy}
                </Badge>
              )}
            </div>

            {hasActiveFilters && (
              <Button variant="outline" onClick={onResetFilters} size="sm">
                <X className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCatalogFilters;
