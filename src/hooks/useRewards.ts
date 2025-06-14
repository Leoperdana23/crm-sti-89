
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
      console.log('Fetching reward catalog...');
      const { data, error } = await supabase
        .from('reward_catalog')
        .select('*')
        .order('cost', { ascending: true });

      if (error) {
        console.error('Error fetching reward catalog:', error);
        throw error;
      }
      
      console.log('Reward catalog fetched:', data);
      return data as RewardItem[];
    },
  });
};

export const useRewardRedemptions = () => {
  return useQuery({
    queryKey: ['reward-redemptions'],
    queryFn: async () => {
      console.log('Fetching reward redemptions...');
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

      if (error) {
        console.error('Error fetching reward redemptions:', error);
        throw error;
      }
      
      console.log('Reward redemptions fetched:', data);
      return data;
    },
    refetchInterval: 5000,
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
      console.log('Creating redemption:', redemption);

      // First validate that the reseller has enough balance
      if (redemption.reward_type === 'points') {
        const { data: resellerData, error: fetchError } = await supabase
          .from('resellers')
          .select('total_points')
          .eq('id', redemption.reseller_id)
          .single();

        if (fetchError) {
          console.error('Error fetching reseller data:', fetchError);
          throw fetchError;
        }

        const currentPoints = resellerData?.total_points || 0;
        if (currentPoints < redemption.amount_redeemed) {
          throw new Error('Poin tidak mencukupi untuk penukaran ini');
        }
      }

      const { data, error } = await supabase
        .from('reward_redemptions')
        .insert({
          reseller_id: redemption.reseller_id,
          reward_type: redemption.reward_type,
          amount_redeemed: redemption.amount_redeemed,
          reward_description: redemption.reward_description,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating redemption:', error);
        throw error;
      }

      console.log('Redemption created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      queryClient.invalidateQueries({ queryKey: ['reseller-orders'] });
      toast({
        title: 'Sukses',
        description: 'Penukaran hadiah berhasil diproses dan menunggu persetujuan',
      });
    },
    onError: (error: any) => {
      console.error('Error creating redemption:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memproses penukaran hadiah',
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
      console.log('Updating redemption status:', redemptionId, status);
      
      // First get the redemption details
      const { data: redemption, error: fetchError } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('id', redemptionId)
        .single();

      if (fetchError) {
        console.error('Error fetching redemption:', fetchError);
        throw fetchError;
      }

      // Update redemption status
      const { data, error } = await supabase
        .from('reward_redemptions')
        .update({
          status,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', redemptionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating redemption:', error);
        throw error;
      }

      // If approved and it's a points redemption, deduct points from reseller
      if (status === 'approved' && redemption.reward_type === 'points') {
        console.log('Deducting points from reseller:', redemption.reseller_id, redemption.amount_redeemed);
        
        const { data: resellerData, error: fetchResellerError } = await supabase
          .from('resellers')
          .select('total_points')
          .eq('id', redemption.reseller_id)
          .single();

        if (fetchResellerError) {
          console.error('Error fetching reseller for points deduction:', fetchResellerError);
          throw fetchResellerError;
        }

        const currentPoints = resellerData?.total_points || 0;
        const newPoints = Math.max(0, currentPoints - redemption.amount_redeemed);

        const { error: updateResellerError } = await supabase
          .from('resellers')
          .update({ total_points: newPoints })
          .eq('id', redemption.reseller_id);
        
        if (updateResellerError) {
          console.error('Error updating reseller points:', updateResellerError);
          throw updateResellerError;
        }

        console.log('Points deducted successfully. New balance:', newPoints);
      }

      console.log('Redemption status updated successfully:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      queryClient.invalidateQueries({ queryKey: ['reseller-orders'] });
      toast({
        title: 'Sukses',
        description: `Penukaran hadiah berhasil ${variables.status === 'approved' ? 'disetujui' : 'ditolak'}`,
      });
    },
    onError: (error: any) => {
      console.error('Error updating redemption:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status penukaran hadiah',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateReward = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rewardData: {
      name: string;
      description?: string;
      reward_type: 'commission' | 'points';
      cost: number;
      image_url?: string;
      is_active?: boolean;
    }) => {
      console.log('Creating reward:', rewardData);

      const { data, error } = await supabase
        .from('reward_catalog')
        .insert({
          ...rewardData,
          is_active: rewardData.is_active ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reward:', error);
        throw error;
      }

      console.log('Reward created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-catalog'] });
      toast({
        title: 'Sukses',
        description: 'Hadiah berhasil ditambahkan',
      });
    },
    onError: (error: any) => {
      console.error('Error creating reward:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan hadiah',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateReward = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      name: string;
      description?: string;
      reward_type: 'commission' | 'points';
      cost: number;
      image_url?: string;
      is_active: boolean;
    }>) => {
      console.log('Updating reward:', id, updates);

      // First check if the reward exists
      const { data: existingReward, error: checkError } = await supabase
        .from('reward_catalog')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingReward) {
        console.error('Reward not found:', id);
        throw new Error('Hadiah tidak ditemukan');
      }

      const { data, error } = await supabase
        .from('reward_catalog')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating reward:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Gagal memperbarui hadiah - tidak ada data yang dikembalikan');
      }

      console.log('Reward updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-catalog'] });
      toast({
        title: 'Sukses',
        description: 'Hadiah berhasil diperbarui',
      });
    },
    onError: (error: any) => {
      console.error('Error updating reward:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui hadiah',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteReward = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting reward (soft delete):', id);

      // First check if the reward exists
      const { data: existingReward, error: checkError } = await supabase
        .from('reward_catalog')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingReward) {
        console.error('Reward not found:', id);
        throw new Error('Hadiah tidak ditemukan');
      }

      const { error } = await supabase
        .from('reward_catalog')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting reward:', error);
        throw error;
      }

      console.log('Reward deleted (deactivated) successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-catalog'] });
      toast({
        title: 'Sukses',
        description: 'Hadiah berhasil dihapus',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting reward:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus hadiah',
        variant: 'destructive',
      });
    },
  });
};
