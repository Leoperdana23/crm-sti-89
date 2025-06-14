
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
import { useOrders } from '@/hooks/useOrders';
import { useRewardCatalog, useRewardRedemptions, useCreateRedemption, useApproveRedemption } from '@/hooks/useRewards';
import { useToast } from '@/hooks/use-toast';

const Commission = () => {
  const { data: resellers, isLoading } = useResellers();
  const { data: orders } = useOrders();
  const { data: rewardCatalog } = useRewardCatalog();
  const { data: redemptions } = useRewardRedemptions();
  const createRedemption = useCreateRedemption();
  const approveRedemption = useApproveRedemption();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReseller, setSelectedReseller] = useState<any>(null);
  const [isRedemptionDialogOpen, setIsRedemptionDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate commission from completed orders using snapshot values
  const calculateResellerCommission = (resellerId: string) => {
    if (!orders) return 0;
    
    const completedOrders = orders.filter(order => 
      order.reseller?.id === resellerId && 
      (order.status === 'completed' || order.status === 'selesai')
    );

    return completedOrders.reduce((total, order) => {
      const orderCommission = order.order_items?.reduce((itemTotal, item) => {
        const commissionSnapshot = (item as any).product_commission_snapshot || 0;
        return itemTotal + (commissionSnapshot * item.quantity);
      }, 0) || 0;
      return total + orderCommission;
    }, 0);
  };

  // Calculate points from completed orders using snapshot values
  const calculateResellerPoints = (resellerId: string) => {
    if (!orders) return 0;
    
    const completedOrders = orders.filter(order => 
      order.reseller?.id === resellerId && 
      (order.status === 'completed' || order.status === 'selesai')
    );

    return completedOrders.reduce((total, order) => {
      const orderPoints = order.order_items?.reduce((itemTotal, item) => {
        const pointsSnapshot = (item as any).product_points_snapshot || 0;
        return itemTotal + (pointsSnapshot * item.quantity);
      }, 0) || 0;
      return total + orderPoints;
    }, 0);
  };

  // Calculate redeemed amounts for each reseller
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

  const filteredResellers = resellers?.filter(reseller => 
    reseller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalCommission: resellers?.reduce((sum, r) => sum + calculateResellerCommission(r.id), 0) || 0,
    totalPoints: resellers?.reduce((sum, r) => sum + calculateResellerPoints(r.id), 0) || 0,
    activeResellers: resellers?.filter(r => r.is_active).length || 0,
    totalRedemptions: redemptions?.length || 0
  };

  const handleRedeemReward = async (reward: any) => {
    if (!selectedReseller) return;

    const earnedCommission = calculateResellerCommission(selectedReseller.id);
    const earnedPoints = calculateResellerPoints(selectedReseller.id);
    const { redeemedCommission, redeemedPoints } = getRedeemedAmounts(selectedReseller.id);
    
    const availableCommission = earnedCommission - redeemedCommission;
    const availablePoints = earnedPoints - redeemedPoints;

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
    } catch (error) {
      console.error('Failed to create redemption:', error);
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
                <p className="text-sm text-gray-600">Total Penukaran</p>
                <p className="text-2xl font-bold">{totalStats.totalRedemptions}</p>
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
              {filteredResellers?.map((reseller) => {
                const earnedCommission = calculateResellerCommission(reseller.id);
                const earnedPoints = calculateResellerPoints(reseller.id);
                const { redeemedCommission, redeemedPoints } = getRedeemedAmounts(reseller.id);
                const availableCommission = earnedCommission - redeemedCommission;
                const availablePoints = earnedPoints - redeemedPoints;
                
                return (
                  <TableRow key={reseller.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reseller.name}</div>
                        <div className="text-sm text-gray-500">{reseller.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{reseller.branches?.name || '-'}</TableCell>
                    <TableCell>{formatCurrency(earnedCommission)}</TableCell>
                    <TableCell>{formatCurrency(redeemedCommission)}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(availableCommission)}
                    </TableCell>
                    <TableCell>{earnedPoints}</TableCell>
                    <TableCell>{redeemedPoints}</TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      {availablePoints}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reseller.is_active ? 'default' : 'secondary'}>
                        {reseller.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog 
                        open={isRedemptionDialogOpen && selectedReseller?.id === reseller.id} 
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
                              setSelectedReseller(reseller);
                              setIsRedemptionDialogOpen(true);
                            }}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Tukar Hadiah
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Tukar Hadiah untuk {reseller.name}</DialogTitle>
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
                              {rewardCatalog?.length === 0 ? (
                                <div className="text-center py-8">
                                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                  <p className="text-gray-500">Belum ada hadiah yang tersedia</p>
                                </div>
                              ) : (
                                rewardCatalog?.map((reward) => {
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
                                          {canRedeem ? 'Tukar' : 'Tidak Cukup'}
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
