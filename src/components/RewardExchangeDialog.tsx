
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRewardCatalog, useCreateRedemption } from '@/hooks/useRewards';

interface RewardExchangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reseller: {
    id: string;
    name: string;
    totalCommission: number;
    totalPoints: number;
  };
  getRedeemedAmounts: (resellerId: string) => {
    redeemedCommission: number;
    redeemedPoints: number;
  };
}

const RewardExchangeDialog: React.FC<RewardExchangeDialogProps> = ({
  isOpen,
  onClose,
  reseller,
  getRedeemedAmounts
}) => {
  const { data: rewardCatalog, isLoading: catalogLoading } = useRewardCatalog();
  const createRedemption = useCreateRedemption();
  const [processingRewardId, setProcessingRewardId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const { redeemedCommission, redeemedPoints } = getRedeemedAmounts(reseller.id);
  const availableCommission = reseller.totalCommission - redeemedCommission;
  const availablePoints = reseller.totalPoints - redeemedPoints;

  const handleRedeemReward = async (reward: any) => {
    if (!reseller) {
      console.error('No reseller selected');
      return;
    }

    console.log('Processing reward redemption:', {
      reward,
      reseller,
      availableCommission,
      availablePoints
    });

    // Validate if reseller has enough balance
    if (reward.reward_type === 'commission' && availableCommission < reward.cost) {
      console.error('Insufficient commission balance');
      return;
    }

    if (reward.reward_type === 'points' && availablePoints < reward.cost) {
      console.error('Insufficient points balance');
      return;
    }

    setProcessingRewardId(reward.id);

    try {
      await createRedemption.mutateAsync({
        reseller_id: reseller.id,
        reward_type: reward.reward_type,
        amount_redeemed: reward.cost,
        reward_description: reward.name
      });

      onClose();
    } catch (error) {
      console.error('Failed to create redemption:', error);
    } finally {
      setProcessingRewardId(null);
    }
  };

  const handleClose = () => {
    if (!createRedemption.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tukar Hadiah untuk {reseller.name}</DialogTitle>
          <DialogDescription>
            Pilih hadiah dari katalog yang tersedia
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Balance Display */}
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

          {/* Rewards List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {catalogLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Memuat katalog hadiah...</span>
              </div>
            ) : !rewardCatalog || rewardCatalog.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada hadiah yang tersedia</p>
              </div>
            ) : (
              rewardCatalog.map((reward) => {
                const canRedeem = reward.reward_type === 'points' 
                  ? availablePoints >= reward.cost
                  : availableCommission >= reward.cost;

                const isProcessing = processingRewardId === reward.id;
                
                return (
                  <div key={reward.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{reward.name}</h4>
                        {reward.description && (
                          <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                        )}
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
                        {!canRedeem && (
                          <p className="text-xs text-red-500 mt-1">
                            {reward.reward_type === 'points' 
                              ? `Poin tidak mencukupi (butuh ${reward.cost}, tersedia ${availablePoints})`
                              : `Komisi tidak mencukupi (butuh ${formatCurrency(reward.cost)}, tersedia ${formatCurrency(availableCommission)})`
                            }
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        disabled={!canRedeem || isProcessing || createRedemption.isPending}
                        onClick={() => handleRedeemReward(reward)}
                        className="ml-4 min-w-[80px]"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Proses...
                          </>
                        ) : canRedeem ? 'Tukar' : 'Tidak Cukup'}
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
  );
};

export default RewardExchangeDialog;
