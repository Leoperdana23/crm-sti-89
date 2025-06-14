
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Survey {
  id: string;
  customer_id: string;
  deal_date: string;
  product_quality: number;
  service_technician: number;
  service_sales: number;
  usage_clarity: number;
  price_approval: boolean;
  testimonial?: string;
  suggestions?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  survey_token: string;
}

export const useSurveys = () => {
  return useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      console.log('Fetching surveys data...');
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('is_completed', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching surveys:', error);
        throw error;
      }

      console.log('Surveys fetched successfully:', data?.length);
      return data as Survey[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};
