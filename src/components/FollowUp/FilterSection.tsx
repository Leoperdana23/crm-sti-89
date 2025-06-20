
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { Branch } from '@/types/branch';

interface FilterSectionProps {
  branches: Branch[];
  selectedBranch: string;
  selectedStatus: string;
  startDate: string;
  endDate: string;
  onBranchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  branches,
  selectedBranch,
  startDate,
  endDate,
  onBranchChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filter Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cabang</label>
            <Select value={selectedBranch} onValueChange={onBranchChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih cabang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Cabang</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Mulai</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Akhir</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Action</label>
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full"
            >
              Reset Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSection;
