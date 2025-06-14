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
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Gift, 
  TrendingUp, 
  Award, 
  Download,
  Search,
  AlertCircle
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useRewardCatalog, useRewardRedemptions, useCreateRedemption, useApproveRedemption } from '@/hooks/useRewards';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Commission = () => {
  const { data: resellers, isLoading } = useResellers();
  const { data: rewardCatalog } = useRewardCatalog();
  const { data: redemptions } = useRewardRedemptions();
  const createRedemption = useCreateRedemption();
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

  // Get redeemed amounts for each reseller
  const getRedeemedAmounts = (resellerId: string) => {
    if (!redemptions) return { redeemedCommission: 0, redeemedPoints: 0 };
    
    const approvedRedemptions = redemptions.filter(
      (r: any) => r.reseller_id === resellerId && r.status === 'approved'
    );

    const redeemedCommission = approvedRedemptions
      .filter((r: any) => r.reward_type === 'commission')
      .reduce((sum: number, r: any) => sum + r.amount_redeemed, 0);

    const redeemedPoints = approvedRedemptions
      .filter((r: any) => r.reward_type === 'points')
      .reduce((sum: number, r: any) => sum + r.amount_redeemed, 0);

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

  const handleRedeemReward = async (reward: any) => {
    if (!selectedReseller) {
      toast({
        title: 'Error',
        description: 'Reseller tidak ditemukan',
        variant: 'destructive',
      });
      return;
    }

    const resellerInfo = resellerData.find(r => r.id === selectedReseller.id);
    if (!resellerInfo) {
      toast({
        title: 'Error',
        description: 'Data reseller tidak ditemukan',
        variant: 'destructive',
      });
      return;
    }

    const { redeemedCommission, redeemedPoints } = getRedeemedAmounts(selectedReseller.id);
    
    const availableCommission = resellerInfo.totalCommission - redeemedCommission;
    const availablePoints = resellerInfo.totalPoints - redeemedPoints;

    console.log('Reward redemption attempt:', {
      reward,
      availableCommission,
      availablePoints,
      rewardCost: reward.cost,
      rewardType: reward.reward_type
    });

    // Validate if reseller has enough balance
    if (reward.reward_type === 'commission' && availableCommission < reward.cost) {
      toast({
        title: 'Error',
        description: 'Komisi tidak mencukupi untuk penukaran ini',
        variant: 'destructive',
      });
      return;
    }

    if (reward.reward_type === 'points' && availablePoints < reward.cost) {
      toast({
        title: 'Error',
        description: 'Poin tidak mencukupi untuk penukaran ini',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createRedemption.mutateAsync({
        reseller_id: selectedReseller.id,
        reward_id: reward.id,
        reward_type: reward.reward_type,
        amount_redeemed: reward.cost,
        reward_description: reward.name
      });

      setIsRedemptionDialogOpen(false);
      setSelectedReseller(null);
      
      toast({
        title: 'Sukses',
        description: 'Penukaran hadiah berhasil diproses',
      });
    } catch (error) {
      console.error('Failed to create redemption:', error);
      toast({
        title: 'Error',
        description: 'Gagal memproses penukaran hadiah',
        variant: 'destructive',
      });
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

  console.log('=== COMMISSION PAGE SUMMARY ===');
  console.log('Total reseller orders:', allResellerOrders?.length);
  console.log('Total resellers:', resellers?.length);
  console.log('Calculated total commission:', totalStats.totalCommission);
  console.log('Calculated total points:', totalStats.totalPoints);
  console.log('Total orders:', totalStats.totalOrders);
  console.log('Total quantity:', totalStats.totalQuantity);

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
                      <Dialog 
                        open={isRedemptionDialogOpen && selectedReseller?.id === resellerInfo.id} 
                        onOpenChange={(open) => {
                          setIsRedemptionDialogOpen(open);
                          if (!open) setSelectedReseller(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedReseller(resellerInfo);
                              setIsRedemptionDialogOpen(true);
                            }}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Tukar Hadiah
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Tukar Hadiah untuk {resellerInfo.name}</DialogTitle>
                            <DialogDescription>
                              Pilih hadiah dari katalog yang tersedia
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Sisa Komisi:</p>
                                  <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(availableCommission)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Sisa Poin:</p>
                                  <p className="text-lg font-bold text-blue-600">
                                    {availablePoints}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto space-y-3">
                              {!rewardCatalog || rewardCatalog.length === 0 ? (
                                <div className="text-center py-8">
                                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                  <p className="text-gray-500">Belum ada hadiah yang tersedia</p>
                                </div>
                              ) : (
                                rewardCatalog
                                  .filter(reward => reward.is_active)
                                  .map((reward) => {
                                    const canRedeem = reward.reward_type === 'points' 
                                      ? availablePoints >= reward.cost
                                      : availableCommission >= reward.cost;
                                    
                                    return (
                                      <div key={reward.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <h4 className="font-medium">{reward.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                              <Badge variant={reward.reward_type === 'points' ? 'secondary' : 'default'}>
                                                {reward.reward_type === 'points' ? 'Poin' : 'Komisi'}
                                              </Badge>
                                              <p className="text-sm font-medium text-blue-600">
                                                {reward.reward_type === 'points' 
                                                  ? `${reward.cost} Poin` 
                                                  : formatCurrency(reward.cost)
                                                }
                                              </p>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            disabled={!canRedeem || createRedemption.isPending}
                                            onClick={() => handleRedeemReward(reward)}
                                            className="ml-4"
                                          >
                                            {createRedemption.isPending ? 'Memproses...' : canRedeem ? 'Tukar' : 'Tidak Cukup'}
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
    </div>
  );
};

export default Commission;
