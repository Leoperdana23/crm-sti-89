
import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  return (
    <Card className="shadow-sm border-0">
      <CardContent className="p-3">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari makanan atau minuman"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="flex-1 text-sm">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="flex-1 text-sm">
                <SelectValue placeholder="Nama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nama</SelectItem>
                <SelectItem value="price-low">Harga Terendah</SelectItem>
                <SelectItem value="price-high">Harga Tertinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;
