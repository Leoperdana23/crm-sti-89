
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContactSettings {
  id: string;
  whatsapp_number?: string;
  email?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export const useContactSettings = () => {
  return useQuery({
    queryKey: ['contact-settings'],
    queryFn: async () => {
      console.log('Fetching contact settings...');
      
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching contact settings:', error);
        throw error;
      }

      console.log('Contact settings fetched:', data);
      return data as ContactSettings;
    },
  });
};

export const useUpdateContactSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<ContactSettings>) => {
      console.log('Updating contact settings:', settings);
      
      const { data, error } = await supabase
        .from('contact_settings')
        .upsert(settings)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact settings:', error);
        throw error;
      }

      console.log('Contact settings updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-settings'] });
      toast({
        title: 'Sukses',
        description: 'Pengaturan kontak berhasil disimpan',
      });
    },
    onError: (error) => {
      console.error('Error updating contact settings:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan kontak',
        variant: 'destructive',
      });
    },
  });
};
