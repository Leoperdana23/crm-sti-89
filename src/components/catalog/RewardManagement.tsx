
import React, { useState } from 'react';
import { Edit, Trash2, Plus, Gift, Image } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRewardCatalog, useDeleteReward } from '@/hooks/useRewards';
import { RewardItem } from '@/hooks/useRewards';
import RewardForm from '@/components/RewardForm';

const RewardManagement = () => {
  const { data: rewards, isLoading } = useRewardCatalog();
  const deleteRewardMutation = useDeleteReward();
  const [rewardFormOpen, setRewardFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardItem | undefined>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEditReward = (reward: RewardItem) => {
    setEditingReward(reward);
    setRewardFormOpen(true);
  };

  const handleDeleteReward = async (rewardId: string) => {
    try {
      await deleteRewardMutation.mutateAsync(rewardId);
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  const handleCloseRewardForm = () => {
    setRewardFormOpen(false);
    setEditingReward(undefined);
  };

  const handleAddReward = () => {
    setEditingReward(undefined);
    setRewardFormOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-gray-500">Memuat hadiah...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Kelola Hadiah Reward
            </CardTitle>
            <Button onClick={handleAddReward} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Hadiah
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rewards && rewards.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>Nama Hadiah</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Biaya</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      {reward.image_url ? (
                        <img 
                          src={reward.image_url} 
                          alt={reward.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{reward.name}</TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {reward.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reward.reward_type === 'points' ? 'default' : 'secondary'}>
                        {reward.reward_type === 'points' ? 'Poin' : 'Komisi'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reward.reward_type === 'points' 
                        ? `${reward.cost} Poin`
                        : formatCurrency(reward.cost)
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                        {reward.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(reward.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditReward(reward)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Hadiah</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus hadiah "{reward.name}"? 
                                Hadiah ini akan dinonaktifkan dan tidak dapat ditukar.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReward(reward.id)}>
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada hadiah
              </h3>
              <p className="text-gray-600 mb-4">
                Tambahkan hadiah yang dapat ditukar dengan poin atau komisi
              </p>
              <Button onClick={handleAddReward}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Hadiah Pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RewardForm 
        isOpen={rewardFormOpen}
        onClose={handleCloseRewardForm}
        reward={editingReward}
      />
    </>
  );
};

export default RewardManagement;
