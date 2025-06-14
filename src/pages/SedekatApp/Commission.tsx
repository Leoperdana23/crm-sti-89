
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
  Gift, 
  TrendingUp, 
  Award, 
  Download,
  Search,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useOrders } from '@/hooks/useOrders';
import { useRewardCatalog, useRewardRedemptions, useCreateRedemption, useApproveRedemption } from '@/hooks/useRewards';

const Commission = () => {
  const { data: resellers, isLoading } = useResellers();
  const { data: orders } = useOrders();
  const { data: rewardCatalog } = useRewardCatalog();
  const { data: redemptions } = useRewardRedemptions();
  const createRedemption = useCreateRedemption();
  const approveRedemption = useApproveRedemption();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReseller, setSelectedReseller] = useState<any>(null);
  const [selectedReward, setSelectedReward] = useState<any>(null);

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

  const filteredResellers = resellers?.filter(reseller => 
    reseller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalCommission: resellers?.reduce((sum, r) => sum + calculateResellerCommission(r.id), 0) || 0,
    totalPoints: resellers?.reduce((sum, r) => sum + calculateResellerPoints(r.id), 0) || 0,
    activeResellers: resellers?.filter(r => r.is_active).length || 0,
    totalRedemptions: redemptions?.length || 0
  };

  const handleRedeemReward = async () => {
    if (!selectedReseller || !selectedReward) return;

    await createRedemption.mutateAsync({
      reseller_id: selectedReseller.id,
      reward_id: selectedReward.id,
      reward_type: selectedReward.reward_type,
      amount_redeemed: selectedReward.cost,
      reward_description: selectedReward.name
    });

    setSelectedReseller(null);
    setSelectedReward(null);
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
                <TableHead>Total Komisi</TableHead>
                <TableHead>Total Poin</TableHead>
                <TableHead>Sisa Poin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResellers?.map((reseller) => {
                const earnedCommission = calculateResellerCommission(reseller.id);
                const earnedPoints = calculateResellerPoints(reseller.id);
                
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
                    <TableCell>{earnedPoints}</TableCell>
                    <TableCell>{reseller.total_points || 0}</TableCell>
                    <TableCell>
                      <Badge variant={reseller.is_active ? 'default' : 'secondary'}>
                        {reseller.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedReseller(reseller)}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Tukar Hadiah
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tukar Hadiah untuk {reseller.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-600">Sisa Poin: {reseller.total_points || 0}</p>
                              <p className="text-sm text-gray-600">Komisi Tersedia: {formatCurrency(earnedCommission)}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {rewardCatalog?.map((reward) => (
                                <div key={reward.id} className="border rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium">{reward.name}</h4>
                                      <p className="text-sm text-gray-600">{reward.description}</p>
                                      <p className="text-sm font-medium text-blue-600">
                                        {reward.reward_type === 'points' ? `${reward.cost} Poin` : formatCurrency(reward.cost)}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      disabled={
                                        reward.reward_type === 'points' 
                                          ? (reseller.total_points || 0) < reward.cost
                                          : earnedCommission < reward.cost
                                      }
                                      onClick={() => {
                                        setSelectedReward(reward);
                                        handleRedeemReward();
                                      }}
                                    >
                                      Tukar
                                    </Button>
                                  </div>
                                </div>
                              ))}
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
