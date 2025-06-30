
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const { data, isLoading, error } = useQuery({
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

  const getAverageRatings = () => {
    if (!data || data.length === 0) {
      return {
        product_quality: 0,
        service_technician: 0,
        service_sales: 0,
        usage_clarity: 0,
        overall: 0,
        recommendationRate: 0
      };
    }

    const totals = data.reduce((acc, survey) => {
      acc.product_quality += survey.product_quality;
      acc.service_technician += survey.service_technician;
      acc.service_sales += survey.service_sales;
      acc.usage_clarity += survey.usage_clarity;
      acc.recommendations += survey.price_approval ? 1 : 0;
      return acc;
    }, {
      product_quality: 0,
      service_technician: 0,
      service_sales: 0,
      usage_clarity: 0,
      recommendations: 0
    });

    const count = data.length;
    const averages = {
      product_quality: totals.product_quality / count,
      service_technician: totals.service_technician / count,
      service_sales: totals.service_sales / count,
      usage_clarity: totals.usage_clarity / count,
      overall: (totals.product_quality + totals.service_technician + totals.service_sales + totals.usage_clarity) / (count * 4),
      recommendationRate: (totals.recommendations / count) * 100
    };

    return averages;
  };

  return {
    surveys: data || [],
    loading: isLoading,
    error,
    getAverageRatings,
  };
};
