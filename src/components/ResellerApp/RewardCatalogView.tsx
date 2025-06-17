
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, DollarSign, Gift, MessageCircle } from 'lucide-react';
import { useRewardCatalog } from '@/hooks/useRewards';
import { useResellerBalance } from '@/hooks/useResellerApp';
import { ResellerSession } from '@/types/resellerApp';

interface RewardCatalogViewProps {
  reseller: ResellerSession;
}

const RewardCatalogView: React.FC<RewardCatalogViewProps> = ({ reseller }) => {
  const { data: rewards = [], isLoading: rewardsLoading } = useRewardCatalog();
  const { data: balance } = useResellerBalance(reseller.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canRedeem = (reward: any) => {
    if (reward.reward_type === 'points') {
      return (balance?.remainingPoints || 0) >= reward.cost;
    } else if (reward.reward_type === 'commission') {
      return (balance?.remainingCommission || 0) >= reward.cost;
    }
    return false;
  };

  const getRedemptionMessage = (reward: any) => {
    const canRedeemReward = canRedeem(reward);
    
    if (canRedeemReward) {
      return {
        message: "Bisa ditukar - Hubungi penjual",
        variant: "default" as const,
        icon: MessageCircle
      };
    } else {
      return {
        message: "Saldo tidak cukup",
        variant: "secondary" as const,
        icon: null
      };
    }
  };

  if (rewardsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Katalog Hadiah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            Katalog Hadiah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Belum ada hadiah tersedia</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-600" />
          Katalog Hadiah
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rewards.map((reward) => {
            const redemptionInfo = getRedemptionMessage(reward);
            const RedemptionIcon = redemptionInfo.icon;
            
            return (
              <div key={reward.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">{reward.name}</h4>
                    {reward.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{reward.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    {reward.reward_type === 'points' ? (
                      <Award className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium">
                      {reward.reward_type === 'points' 
                        ? `${reward.cost} poin` 
                        : formatCurrency(reward.cost)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge variant={redemptionInfo.variant} className="text-xs">
                    {RedemptionIcon && <RedemptionIcon className="h-3 w-3 mr-1" />}
                    {redemptionInfo.message}
                  </Badge>
                  
                  {/* Show current balance for context */}
                  <div className="text-xs text-gray-500">
                    Saldo: {reward.reward_type === 'points' 
                      ? `${balance?.remainingPoints || 0} poin`
                      : formatCurrency(balance?.remainingCommission || 0)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Info footer */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Untuk menukar hadiah, hubungi penjual dengan menyebutkan nama hadiah yang diinginkan
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardCatalogView;
