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
        .eq('is_active', true)
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
    refetchInterval: 3000,
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

      // Validate input data
      if (!redemption.reseller_id || !redemption.reward_id || !redemption.reward_type || !redemption.amount_redeemed) {
        throw new Error('Data penukaran tidak lengkap');
      }

      if (redemption.amount_redeemed <= 0) {
        throw new Error('Jumlah penukaran harus lebih dari 0');
      }

      // Check if reward exists and is active
      const { data: rewardData, error: rewardError } = await supabase
        .from('reward_catalog')
        .select('*')
        .eq('id', redemption.reward_id)
        .eq('is_active', true)
        .single();

      if (rewardError) {
        console.error('Error checking reward:', rewardError);
        throw new Error('Hadiah tidak ditemukan atau tidak aktif');
      }

      // Check if reseller exists and is active
      const { data: resellerData, error: resellerError } = await supabase
        .from('resellers')
        .select('*')
        .eq('id', redemption.reseller_id)
        .eq('is_active', true)
        .single();

      if (resellerError) {
        console.error('Error checking reseller:', resellerError);
        throw new Error('Reseller tidak ditemukan atau tidak aktif');
      }

      // Create redemption record
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
        throw new Error('Gagal membuat permintaan penukaran hadiah');
      }

      console.log('Redemption created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      queryClient.invalidateQueries({ queryKey: ['reseller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-reseller-orders'] });
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
      
      if (!redemptionId || !status) {
        throw new Error('Data persetujuan tidak lengkap');
      }

      // First get the redemption details
      const { data: redemption, error: fetchError } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('id', redemptionId)
        .single();

      if (fetchError) {
        console.error('Error fetching redemption:', fetchError);
        throw new Error('Gagal mengambil data penukaran hadiah');
      }

      if (!redemption) {
        throw new Error('Penukaran hadiah tidak ditemukan');
      }

      if (redemption.status !== 'pending') {
        throw new Error('Penukaran hadiah sudah diproses sebelumnya');
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
        throw new Error('Gagal memperbarui status penukaran hadiah');
      }

      console.log('Redemption status updated successfully:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      queryClient.invalidateQueries({ queryKey: ['reseller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-reseller-orders'] });
      toast({
        title: 'Sukses',
        description: `Penukaran hadiah berhasil ${variables.status === 'approved' ? 'disetujui' : 'ditolak'}`,
      });
    },
    onError: (error: any) => {
      console.error('Error updating redemption:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui status penukaran hadiah',
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
        .maybeSingle();

      if (checkError) {
        console.error('Error checking reward:', checkError);
        throw new Error('Gagal memvalidasi hadiah');
      }

      if (!existingReward) {
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
        .maybeSingle();

      if (checkError) {
        console.error('Error checking reward:', checkError);
        throw new Error('Gagal memvalidasi hadiah');
      }

      if (!existingReward) {
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
