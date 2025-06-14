
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, User, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';

interface CommissionData {
  resellerId: string;
  resellerName: string;
  totalCommission: number;
  totalOrders: number;
  paidCommission: number;
  unpaidCommission: number;
  status: 'paid' | 'unpaid' | 'partial';
}

const CommissionTab = () => {
  const { data: orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate commission data from orders using snapshot values
  const calculateCommissionData = (): CommissionData[] => {
    if (!orders) return [];

    const commissionMap = new Map<string, CommissionData>();

    orders.forEach(order => {
      if (!order.reseller) return;

      const resellerId = order.reseller.id;
      const resellerName = order.reseller.name;

      // Calculate commission using snapshot values from order items
      const orderCommission = order.order_items?.reduce((total, item) => {
        const snapshotCommission = (item as any).product_commission_snapshot || 0;
        return total + (snapshotCommission * item.quantity);
      }, 0) || 0;

      if (!commissionMap.has(resellerId)) {
        commissionMap.set(resellerId, {
          resellerId,
          resellerName,
          totalCommission: 0,
          totalOrders: 0,
          paidCommission: 0,
          unpaidCommission: 0,
          status: 'unpaid'
        });
      }

      const data = commissionMap.get(resellerId)!;
      data.totalCommission += orderCommission;
      data.totalOrders += 1;

      // Consider completed orders as paid, others as unpaid
      if (order.status === 'completed' || order.status === 'selesai') {
        data.paidCommission += orderCommission;
      } else {
        data.unpaidCommission += orderCommission;
      }
    });

    // Determine status for each reseller
    commissionMap.forEach(data => {
      if (data.paidCommission === data.totalCommission && data.totalCommission > 0) {
        data.status = 'paid';
      } else if (data.paidCommission > 0 && data.unpaidCommission > 0) {
        data.status = 'partial';
      } else {
        data.status = 'unpaid';
      }
    });

    return Array.from(commissionMap.values());
  };

  const commissionData = calculateCommissionData();

  const filteredData = commissionData.filter(data => {
    const matchesSearch = data.resellerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || data.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Terbayar';
      case 'partial':
        return 'Sebagian';
      case 'unpaid':
        return 'Belum Bayar';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'partial':
      case 'unpaid':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const totalCommissionAll = filteredData.reduce((sum, data) => sum + data.totalCommission, 0);
  const totalPaidAll = filteredData.reduce((sum, data) => sum + data.paidCommission, 0);
  const totalUnpaidAll = filteredData.reduce((sum, data) => sum + data.unpaidCommission, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Komisi</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(totalCommissionAll)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Komisi Terbayar</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaidAll)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Komisi Belum Bayar</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalUnpaidAll)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari reseller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="paid">Terbayar</SelectItem>
            <SelectItem value="partial">Sebagian</SelectItem>
            <SelectItem value="unpaid">Belum Bayar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commission List */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tidak ada data komisi yang sesuai dengan filter'
                  : 'Belum ada data komisi'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((data) => (
            <Card key={data.resellerId}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {data.resellerName}
                  </CardTitle>
                  <Badge className={getStatusColor(data.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(data.status)}
                      {getStatusLabel(data.status)}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Order</p>
                    <p className="font-semibold">{data.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Komisi</p>
                    <p className="font-semibold">{formatCurrency(data.totalCommission)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Terbayar</p>
                    <p className="font-semibold text-green-600">{formatCurrency(data.paidCommission)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Belum Bayar</p>
                    <p className="font-semibold text-red-600">{formatCurrency(data.unpaidCommission)}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    Lihat Detail
                  </Button>
                  {data.unpaidCommission > 0 && (
                    <Button size="sm" variant="default">
                      Bayar Komisi
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommissionTab;
