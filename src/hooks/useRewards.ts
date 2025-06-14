
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
      reward_type: 'commission' | 'points';
      amount_redeemed: number;
      reward_description: string;
    }) => {
      console.log('Creating redemption with data:', redemption);

      // Validate required fields
      if (!redemption.reseller_id) {
        throw new Error('ID reseller diperlukan');
      }
      
      if (!redemption.reward_type || !['commission', 'points'].includes(redemption.reward_type)) {
        throw new Error('Jenis hadiah tidak valid');
      }

      if (!redemption.amount_redeemed || redemption.amount_redeemed <= 0) {
        throw new Error('Jumlah penukaran harus lebih dari 0');
      }

      if (!redemption.reward_description) {
        throw new Error('Deskripsi hadiah diperlukan');
      }

      // Check if reseller exists and is active
      const { data: resellerData, error: resellerError } = await supabase
        .from('resellers')
        .select('id, name, is_active')
        .eq('id', redemption.reseller_id)
        .single();

      if (resellerError) {
        console.error('Error checking reseller:', resellerError);
        throw new Error('Reseller tidak ditemukan');
      }

      if (!resellerData.is_active) {
        throw new Error('Reseller tidak aktif');
      }

      // Create redemption record with explicit field mapping
      const insertData = {
        reseller_id: redemption.reseller_id,
        reward_type: redemption.reward_type,
        amount_redeemed: Number(redemption.amount_redeemed),
        reward_description: redemption.reward_description,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting redemption data:', insertData);

      const { data, error } = await supabase
        .from('reward_redemptions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating redemption:', error);
        throw new Error(`Gagal membuat penukaran hadiah: ${error.message}`);
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
        description: 'Penukaran hadiah berhasil dibuat dan menunggu persetujuan',
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
      
      if (!redemptionId) {
        throw new Error('ID penukaran diperlukan');
      }

      if (!status || !['approved', 'rejected'].includes(status)) {
        throw new Error('Status tidak valid');
      }

      // First get the redemption details
      const { data: redemption, error: fetchError } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('id', redemptionId)
        .single();

      if (fetchError) {
        console.error('Error fetching redemption:', fetchError);
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
        throw new Error(`Gagal memperbarui status: ${error.message}`);
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
