
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PromoBenefitSettings {
  id: string;
  bonus_commission_enabled: boolean;
  bonus_commission_rate: number;
  points_system_enabled: boolean;
  monthly_target_enabled: boolean;
  monthly_target_10: number;
  monthly_target_20: number;
  promo_title: string;
  promo_description: string;
  welcome_message: string;
  cta_button_1_text: string;
  cta_button_2_text: string;
  gift_target_10: string;
  gift_target_20: string;
  points_per_order: number;
  points_target_10: number;
  points_target_20: number;
  commission_per_point: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePromoBenefitSettings = () => {
  return useQuery({
    queryKey: ['promo-benefit-settings'],
    queryFn: async () => {
      console.log('Fetching promo benefit settings...');
      
      const { data, error } = await supabase
        .from('promo_benefit_settings')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching promo benefit settings:', error);
        throw error;
      }

      console.log('Promo benefit settings fetched:', data);
      return data as PromoBenefitSettings;
    },
  });
};

export const useUpdatePromoBenefitSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<PromoBenefitSettings>) => {
      console.log('Updating promo benefit settings:', settings);
      
      // Get existing data first for upsert
      const { data: existing } = await supabase
        .from('promo_benefit_settings')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('promo_benefit_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating promo benefit settings:', error);
          throw error;
        }
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('promo_benefit_settings')
          .insert({
            ...settings,
            is_active: true
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error inserting promo benefit settings:', error);
          throw error;
        }
        result = data;
      }

      console.log('Promo benefit settings updated successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-benefit-settings'] });
      toast({
        title: 'Sukses',
        description: 'Pengaturan program promo berhasil disimpan',
      });
    },
    onError: (error) => {
      console.error('Error updating promo benefit settings:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan program promo',
        variant: 'destructive',
      });
    },
  });
};
