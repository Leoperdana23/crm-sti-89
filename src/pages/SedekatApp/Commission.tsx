
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
  Loader2
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useRewardRedemptions, useApproveRedemption } from '@/hooks/useRewards';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RewardExchangeDialog from '@/components/RewardExchangeDialog';

const Commission = () => {
  const { data: resellers, isLoading } = useResellers();
  const { data: redemptions } = useRewardRedemptions();
  const approveRedemption = useApproveRedemption();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReseller, setSelectedReseller] = useState<any>(null);
  const [isRedemptionDialogOpen, setIsRedemptionDialogOpen] = useState(false);

  // Fetch all reseller orders with order items for commission calculation
  const { data: allResellerOrders } = useQuery({
    queryKey: ['all-reseller-orders'],
    queryFn: async () => {
      console.log('Fetching all reseller orders for commission calculation...');
      
      const { data, error } = await supabase
        .from('reseller_orders')
        .select(`
          *,
          orders (
            *,
            order_items (
              *,
              product_commission_snapshot,
              product_points_snapshot
            )
          ),
          resellers (
            id,
            name,
            phone,
            total_points,
            is_active,
            branches (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reseller orders:', error);
        throw error;
      }

      console.log('All reseller orders fetched:', data);
      return data || [];
    },
    refetchInterval: 5000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate commission and points data from reseller orders
  const calculateResellerData = () => {
    if (!allResellerOrders || !resellers) return [];

    console.log('Calculating reseller data from orders...');
    
    const resellerMap = new Map();

    // Initialize all resellers
    resellers.forEach(reseller => {
      resellerMap.set(reseller.id, {
        id: reseller.id,
        name: reseller.name,
        phone: reseller.phone,
        branch: reseller.branches?.name || '-',
        isActive: reseller.is_active,
        totalCommission: 0,
        totalPoints: 0,
        totalOrders: 0,
        totalQuantity: 0,
        completedOrders: 0,
        pendingOrders: 0
      });
    });

    // Aggregate data from reseller orders
    allResellerOrders.forEach(resellerOrder => {
      if (resellerOrder.reseller_id && resellerMap.has(resellerOrder.reseller_id)) {
        const resellerData = resellerMap.get(resellerOrder.reseller_id);
        const order = resellerOrder.orders;
        
        if (order) {
          // Calculate commission from snapshot values
          const orderCommission = order.order_items?.reduce((total: number, item: any) => {
            const snapshotCommission = item.product_commission_snapshot || 0;
            return total + (snapshotCommission * item.quantity);
          }, 0) || 0;

          // Calculate points from snapshot values
          const orderPoints = order.order_items?.reduce((total: number, item: any) => {
            const snapshotPoints = item.product_points_snapshot || 0;
            return total + (snapshotPoints * item.quantity);
          }, 0) || 0;

          // Calculate total quantity
          const orderQuantity = order.order_items?.reduce((total: number, item: any) => {
            return total + item.quantity;
          }, 0) || 0;

          resellerData.totalCommission += orderCommission;
          resellerData.totalPoints += orderPoints;
          resellerData.totalOrders += 1;
          resellerData.totalQuantity += orderQuantity;

          // Count by status
          if (order.status === 'selesai') {
            resellerData.completedOrders += 1;
          } else if (order.status === 'pending') {
            resellerData.pendingOrders += 1;
          }
        }
      }
    });

    const result = Array.from(resellerMap.values());
    console.log('Calculated reseller data:', result);
    return result;
  };

  // Get redeemed amounts for each reseller - ONLY count approved redemptions
  const getRedeemedAmounts = (resellerId: string) => {
    if (!redemptions) return { redeemedCommission: 0, redeemedPoints: 0 };
    
    const approvedRedemptions = redemptions.filter(
      (r: any) => r.reseller_id === resellerId && r.status === 'approved'
    );

    const redeemedCommission = approvedRedemptions
      .filter((r: any) => r.reward_type === 'commission')
      .reduce((sum: number, r: any) => sum + (r.amount_redeemed || 0), 0);

    const redeemedPoints = approvedRedemptions
      .filter((r: any) => r.reward_type === 'points')
      .reduce((sum: number, r: any) => sum + (r.amount_redeemed || 0), 0);

    console.log(`Redeemed amounts for ${resellerId}:`, { redeemedCommission, redeemedPoints });
    return { redeemedCommission, redeemedPoints };
  };

  const resellerData = calculateResellerData();
  
  const filteredData = resellerData.filter(data => 
    data.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalCommission: resellerData.reduce((sum, r) => sum + r.totalCommission, 0),
    totalPoints: resellerData.reduce((sum, r) => sum + r.totalPoints, 0),
    totalOrders: resellerData.reduce((sum, r) => sum + r.totalOrders, 0),
    totalQuantity: resellerData.reduce((sum, r) => sum + r.totalQuantity, 0),
    activeResellers: resellerData.filter(r => r.isActive).length,
    totalRedemptions: redemptions?.length || 0
  };

  const handleOpenRedemptionDialog = (resellerInfo: any) => {
    if (!resellerInfo.isActive) {
      toast({
        title: 'Error',
        description: 'Reseller tidak aktif',
        variant: 'destructive',
      });
      return;
    }

    console.log('Opening redemption dialog for reseller:', resellerInfo);
    setSelectedReseller(resellerInfo);
    setIsRedemptionDialogOpen(true);
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

  console.log('=== COMMISSION PAGE SUMMARY ===');
  console.log('Total reseller orders:', allResellerOrders?.length);
  console.log('Total resellers:', resellers?.length);
  console.log('Calculated total commission:', totalStats.totalCommission);
  console.log('Calculated total points:', totalStats.totalPoints);
  console.log('Total redemptions:', redemptions?.length);

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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <p className="text-sm text-gray-600">Total Qty</p>
                <p className="text-2xl font-bold">{totalStats.totalQuantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Order</p>
                <p className="text-2xl font-bold">{totalStats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-indigo-500" />
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
                <TableHead>Total Order</TableHead>
                <TableHead>Total Qty</TableHead>
                <TableHead>Komisi Diperoleh</TableHead>
                <TableHead>Komisi Ditukar</TableHead>
                <TableHead>Sisa Komisi</TableHead>
                <TableHead>Poin Diperoleh</TableHead>
                <TableHead>Poin Ditukar</TableHead>
                <TableHead>Sisa Poin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.map((resellerInfo) => {
                const { redeemedCommission, redeemedPoints } = getRedeemedAmounts(resellerInfo.id);
                const availableCommission = resellerInfo.totalCommission - redeemedCommission;
                const availablePoints = resellerInfo.totalPoints - redeemedPoints;
                
                return (
                  <TableRow key={resellerInfo.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{resellerInfo.name}</div>
                        <div className="text-sm text-gray-500">{resellerInfo.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{resellerInfo.branch}</TableCell>
                    <TableCell>{resellerInfo.totalOrders}</TableCell>
                    <TableCell>{resellerInfo.totalQuantity}</TableCell>
                    <TableCell>{formatCurrency(resellerInfo.totalCommission)}</TableCell>
                    <TableCell>{formatCurrency(redeemedCommission)}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(availableCommission)}
                    </TableCell>
                    <TableCell>{resellerInfo.totalPoints}</TableCell>
                    <TableCell>{redeemedPoints}</TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      {availablePoints}
                    </TableCell>
                    <TableCell>
                      <Badge variant={resellerInfo.isActive ? 'default' : 'secondary'}>
                        {resellerInfo.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenRedemptionDialog(resellerInfo)}
                        disabled={!resellerInfo.isActive}
                      >
                        <Gift className="h-4 w-4 mr-1" />
                        Tukar Hadiah
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reward Exchange History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Penukaran Hadiah</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Reseller</TableHead>
                <TableHead>Hadiah</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions?.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>
                    {new Date(redemption.created_at).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>{(redemption as any).resellers?.name}</TableCell>
                  <TableCell>{redemption.reward_description}</TableCell>
                  <TableCell>
                    <Badge variant={redemption.reward_type === 'points' ? 'secondary' : 'default'}>
                      {redemption.reward_type === 'points' ? 'Poin' : 'Komisi'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {redemption.reward_type === 'points' 
                      ? `${redemption.amount_redeemed} Poin`
                      : formatCurrency(redemption.amount_redeemed)
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      redemption.status === 'approved' ? 'default' :
                      redemption.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {redemption.status === 'approved' ? 'Disetujui' :
                       redemption.status === 'rejected' ? 'Ditolak' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {redemption.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          disabled={approveRedemption.isPending}
                          onClick={() => approveRedemption.mutate({
                            redemptionId: redemption.id,
                            status: 'approved'
                          })}
                        >
                          {approveRedemption.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={approveRedemption.isPending}
                          onClick={() => approveRedemption.mutate({
                            redemptionId: redemption.id,
                            status: 'rejected'
                          })}
                        >
                          Tolak
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reward Exchange Dialog */}
      {selectedReseller && (
        <RewardExchangeDialog
          isOpen={isRedemptionDialogOpen}
          onClose={() => {
            setIsRedemptionDialogOpen(false);
            setSelectedReseller(null);
          }}
          reseller={selectedReseller}
          getRedeemedAmounts={getRedeemedAmounts}
        />
      )}
    </div>
  );
};

export default Commission;
