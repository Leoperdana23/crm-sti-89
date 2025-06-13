
import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCategory } from '@/types/product';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categories: ProductCategory[];
}

const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories
}: SearchAndFilterProps) => {
  const handleReset = () => {
    onSearchChange('');
    onCategoryChange('all');
    onSortChange('name');
  };

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || sortBy !== 'name';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama produk atau deskripsi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-48">
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
        </div>

        {/* Sort Options */}
        <div className="w-full sm:w-48">
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

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Filter aktif:</span>
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
      )}
    </div>
  );
};

export default SearchAndFilter;
