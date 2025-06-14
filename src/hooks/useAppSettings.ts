
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AppSettings {
  id: string;
  notifications: {
    whatsapp: boolean;
    email: boolean;
    push: boolean;
  };
  catalog: {
    siteName: string;
    welcomeText: string;
    bannerUrl: string;
    primaryColor: string;
    secondaryColor: string;
    description?: string;
  };
  operating_hours: {
    start: string;
    end: string;
    timezone: string;
  };
  auto_reply: {
    enabled: boolean;
    message: string;
  };
  allow_registration?: boolean;
  auto_moderation?: boolean;
  created_at: string;
  updated_at: string;
}

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      console.log('Fetching app settings...');
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching app settings:', error);
        throw error;
      }

      console.log('App settings fetched:', data);
      return data as AppSettings;
    },
  });
};

export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<AppSettings>) => {
      console.log('Updating app settings:', settings);
      
      // Get existing data first for upsert
      const { data: existing } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('app_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating app settings:', error);
          throw error;
        }
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('app_settings')
          .insert(settings)
          .select()
          .single();
        
        if (error) {
          console.error('Error inserting app settings:', error);
          throw error;
        }
        result = data;
      }

      console.log('App settings updated successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      toast({
        title: 'Sukses',
        description: 'Pengaturan aplikasi berhasil disimpan',
      });
    },
    onError: (error) => {
      console.error('Error updating app settings:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan aplikasi',
        variant: 'destructive',
      });
    },
  });
};
