
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays } from 'lucide-react';

interface DateRangeFilterProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4" />
          <h3 className="font-medium">Filter Periode</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="period">Periode</Label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="this_week">Minggu Ini</SelectItem>
                <SelectItem value="this_month">Bulan Ini</SelectItem>
                <SelectItem value="last_month">Bulan Lalu</SelectItem>
                <SelectItem value="this_quarter">Kuartal Ini</SelectItem>
                <SelectItem value="this_year">Tahun Ini</SelectItem>
                <SelectItem value="last_year">Tahun Lalu</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedPeriod === 'custom' && (
            <>
              <div>
                <Label htmlFor="start-date">Tanggal Mulai</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => onCustomStartDateChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Tanggal Selesai</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => onCustomEndDateChange(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangeFilter;
