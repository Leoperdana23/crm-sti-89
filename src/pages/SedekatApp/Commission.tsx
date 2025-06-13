
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Gift, 
  TrendingUp, 
  Award, 
  Download,
  Search,
  Calendar
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';

const Commission = () => {
  const { data: resellers, isLoading } = useResellers();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredResellers = resellers?.filter(reseller => 
    reseller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalCommission: resellers?.reduce((sum, r) => sum + (r.commission_rate || 0), 0) || 0,
    totalPoints: resellers?.reduce((sum, r) => sum + (r.total_points || 0), 0) || 0,
    activeResellers: resellers?.filter(r => r.is_active).length || 0
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Komisi & Poin</h1>
          <p className="text-gray-600">Kelola komisi dan sistem poin reseller</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Komisi</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStats.totalCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Poin</p>
                <p className="text-2xl font-bold">{totalStats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Gift className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Hadiah Ditukar</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Reseller Aktif</p>
                <p className="text-2xl font-bold">{totalStats.activeResellers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari reseller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Periode</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="year">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Commission Table */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Komisi & Poin Reseller</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reseller</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Rate Komisi</TableHead>
                <TableHead>Total Komisi</TableHead>
                <TableHead>Total Poin</TableHead>
                <TableHead>Poin Terpakai</TableHead>
                <TableHead>Sisa Poin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResellers?.map((reseller) => (
                <TableRow key={reseller.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reseller.name}</div>
                      <div className="text-sm text-gray-500">{reseller.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{reseller.branches?.name || '-'}</TableCell>
                  <TableCell>{reseller.commission_rate}%</TableCell>
                  <TableCell>{formatCurrency(0)}</TableCell>
                  <TableCell>{reseller.total_points || 0}</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>{reseller.total_points || 0}</TableCell>
                  <TableCell>
                    <Badge variant={reseller.is_active ? 'default' : 'secondary'}>
                      {reseller.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Gift className="h-4 w-4 mr-1" />
                        Tukar Hadiah
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reward Exchange Section */}
      <Card>
        <CardHeader>
          <CardTitle>Penukaran Hadiah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Gift className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-medium">Voucher Belanja 50K</p>
                    <p className="text-sm text-gray-600">1000 Poin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Gift className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">Voucher Belanja 100K</p>
                    <p className="text-sm text-gray-600">2000 Poin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Gift className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="font-medium">Bonus Komisi 5%</p>
                    <p className="text-sm text-gray-600">5000 Poin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Commission;
