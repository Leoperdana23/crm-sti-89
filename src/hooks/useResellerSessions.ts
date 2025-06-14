
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useResellerSessions = () => {
  return useQuery({
    queryKey: ['reseller-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reseller_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reseller sessions:', error);
        throw error;
      }

      return data || [];
    },
  });
};
