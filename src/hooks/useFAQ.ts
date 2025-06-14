
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useFAQItems = () => {
  return useQuery({
    queryKey: ['faq-items'],
    queryFn: async () => {
      console.log('Fetching FAQ items...');
      
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching FAQ items:', error);
        throw error;
      }

      console.log('FAQ items fetched:', data?.length);
      return data as FAQItem[];
    },
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (faqData: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating FAQ item:', faqData);
      
      const { data, error } = await supabase
        .from('faq_items')
        .insert(faqData)
        .select()
        .single();

      if (error) {
        console.error('Error creating FAQ item:', error);
        throw error;
      }

      console.log('FAQ item created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      toast({
        title: 'Sukses',
        description: 'FAQ berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error creating FAQ item:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat FAQ',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...faqData }: Partial<FAQItem> & { id: string }) => {
      console.log('Updating FAQ item:', id, faqData);
      
      const { data, error } = await supabase
        .from('faq_items')
        .update(faqData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating FAQ item:', error);
        throw error;
      }

      console.log('FAQ item updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      toast({
        title: 'Sukses',
        description: 'FAQ berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating FAQ item:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui FAQ',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting FAQ item:', id);
      
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting FAQ item:', error);
        throw error;
      }

      console.log('FAQ item deleted successfully');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      toast({
        title: 'Sukses',
        description: 'FAQ berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting FAQ item:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus FAQ',
        variant: 'destructive',
      });
    },
  });
};
