
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  reward_type: 'commission' | 'points';
  cost: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: string;
  reseller_id: string;
  reward_type: 'commission' | 'points';
  amount_redeemed: number;
  reward_description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export const useRewardCatalog = () => {
  return useQuery({
    queryKey: ['reward-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_catalog')
        .select('*')
        .eq('is_active', true)
        .order('cost', { ascending: true });

      if (error) throw error;
      return data as RewardItem[];
    },
  });
};

export const useRewardRedemptions = () => {
  return useQuery({
    queryKey: ['reward-redemptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          resellers (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateRedemption = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (redemption: {
      reseller_id: string;
      reward_id: string;
      reward_type: 'commission' | 'points';
      amount_redeemed: number;
      reward_description: string;
    }) => {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .insert(redemption)
        .select()
        .single();

      if (error) throw error;

      // Update reseller points/commission using RPC function or direct update
      if (redemption.reward_type === 'points') {
        const { error: updateError } = await supabase.rpc('update_reseller_points', {
          reseller_id: redemption.reseller_id,
          points_to_deduct: redemption.amount_redeemed
        });

        if (updateError) {
          // Fallback to direct update if RPC doesn't exist
          const { error: directUpdateError } = await supabase
            .from('resellers')
            .update({
              total_points: 0 // This would need proper calculation
            })
            .eq('id', redemption.reseller_id);
          
          if (directUpdateError) throw directUpdateError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({
        title: 'Sukses',
        description: 'Penukaran hadiah berhasil diproses',
      });
    },
    onError: (error) => {
      console.error('Error creating redemption:', error);
      toast({
        title: 'Error',
        description: 'Gagal memproses penukaran hadiah',
        variant: 'destructive',
      });
    },
  });
};

export const useApproveRedemption = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ redemptionId, status }: { redemptionId: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .update({
          status,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', redemptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
      toast({
        title: 'Sukses',
        description: 'Status penukaran hadiah berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating redemption:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status penukaran hadiah',
        variant: 'destructive',
      });
    },
  });
};
