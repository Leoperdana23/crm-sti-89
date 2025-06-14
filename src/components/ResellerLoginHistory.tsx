
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  History, 
  Search,
  Filter,
  Download,
  Phone,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { useResellerLoginHistory } from '@/hooks/useResellerLoginHistory';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const ResellerLoginHistory = () => {
  const { data: loginHistory, isLoading } = useResellerLoginHistory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredHistory = loginHistory?.filter(record => {
    const matchesSearch = 
      record.resellers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.resellers?.phone.includes(searchTerm) ||
      record.resellers?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = methodFilter === 'all' || record.login_method === methodFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const loginDate = new Date(record.login_time);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = loginDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = loginDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = loginDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesMethod && matchesDate;
  });

  const calculateSessionDuration = (loginTime: string, logoutTime?: string) => {
    if (!logoutTime) return 'Aktif';
    
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const duration = Math.floor((logout.getTime() - login.getTime()) / (1000 * 60));
    
    if (duration < 60) {
      return `${duration} menit`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}j ${minutes}m`;
    }
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

  const stats = {
    total: loginHistory?.length || 0,
    today: loginHistory?.filter(r => 
      new Date(r.login_time).toDateString() === new Date().toDateString()
    ).length || 0,
    active: loginHistory?.filter(r => !r.logout_time).length || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Riwayat Login Reseller</h1>
          <p className="text-gray-600">Pantau aktivitas login reseller</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <History className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Login</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Login Hari Ini</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Sesi Aktif</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan nama, telepon, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Metode Login" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="pin">PIN</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Waktu</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">30 Hari Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Login History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reseller</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Waktu Login</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Durasi Sesi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="font-medium">{record.resellers?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3" />
                      {record.resellers?.phone || 'N/A'}
                    </div>
                    {record.resellers?.email && (
                      <div className="text-xs text-gray-500">{record.resellers.email}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {format(new Date(record.login_time), 'dd/MM/yyyy HH:mm', { locale: id })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.login_method === 'password' ? 'default' : 'secondary'}>
                      {record.login_method === 'password' ? 'Password' : 'PIN'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {calculateSessionDuration(record.login_time, record.logout_time)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.logout_time ? 'secondary' : 'default'}>
                      {record.logout_time ? 'Selesai' : 'Aktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500">
                      {record.ip_address || 'N/A'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredHistory?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm || methodFilter !== 'all' || dateFilter !== 'all'
                  ? 'Tidak ada riwayat login yang sesuai dengan filter'
                  : 'Belum ada riwayat login reseller'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellerLoginHistory;
