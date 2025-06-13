
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Survey {
  id: string;
  customer_id: string;
  deal_date: string;
  product_quality: number;
  service_sales: number;
  service_technician: number;
  usage_clarity: number;
  price_approval: boolean;
  testimonial?: string;
  suggestions?: string;
  is_completed: boolean;
  completed_at?: string;
  survey_token?: string;
  created_at: string;
  customers?: {
    name: string;
    phone: string;
  };
}

// Fallback sample data
const fallbackSurveys: Survey[] = [
  {
    id: 'survey-1',
    customer_id: '3',
    deal_date: '2024-06-10',
    product_quality: 5,
    service_sales: 5,
    service_technician: 4,
    usage_clarity: 5,
    price_approval: true,
    testimonial: 'Sangat puas dengan layanan dan produknya. Sistem POS berjalan dengan baik.',
    suggestions: 'Mungkin bisa ditambahkan fitur laporan yang lebih detail.',
    is_completed: true,
    completed_at: '2024-06-11T10:30:00Z',
    survey_token: 'abc123def456',
    created_at: '2024-06-10T09:00:00Z',
    customers: {
      name: 'Agus Wijaya',
      phone: '081122334455'
    }
  }
];

export const useSurveys = () => {
  const query = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      try {
        console.log('Fetching surveys...');
        
        const { data, error } = await supabase
          .from('surveys')
          .select(`
            *,
            customers (
              name,
              phone
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching surveys:', error);
          console.log('Using fallback survey data');
          return fallbackSurveys;
        }

        if (data && data.length > 0) {
          console.log('Surveys fetched successfully:', data);
          return data as Survey[];
        } else {
          console.log('No surveys found, using fallback data');
          return fallbackSurveys;
        }
      } catch (error) {
        console.error('Network error fetching surveys:', error);
        console.log('Using fallback survey data due to network error');
        return fallbackSurveys;
      }
    },
  });

  const getAverageRatings = () => {
    const surveys = query.data || fallbackSurveys;
    const completedSurveys = surveys.filter(s => s.is_completed);
    
    if (completedSurveys.length === 0) {
      return {
        product_quality: 0,
        service_sales: 0,
        service_technician: 0,
        usage_clarity: 0,
        priceApprovalRate: 0,
        total: 0
      };
    }

    const totals = completedSurveys.reduce((acc, survey) => ({
      product_quality: acc.product_quality + survey.product_quality,
      service_sales: acc.service_sales + survey.service_sales,
      service_technician: acc.service_technician + survey.service_technician,
      usage_clarity: acc.usage_clarity + survey.usage_clarity,
      price_approvals: acc.price_approvals + (survey.price_approval ? 1 : 0),
    }), { product_quality: 0, service_sales: 0, service_technician: 0, usage_clarity: 0, price_approvals: 0 });

    const count = completedSurveys.length;
    return {
      product_quality: Math.round((totals.product_quality / count) * 10) / 10,
      service_sales: Math.round((totals.service_sales / count) * 10) / 10,
      service_technician: Math.round((totals.service_technician / count) * 10) / 10,
      usage_clarity: Math.round((totals.usage_clarity / count) * 10) / 10,
      priceApprovalRate: Math.round((totals.price_approvals / count) * 100 * 10) / 10,
      total: count
    };
  };

  const addSurvey = async (surveyData: Omit<Survey, 'id' | 'created_at' | 'customers'>) => {
    console.log('Adding survey:', surveyData);
    
    const { data, error } = await supabase
      .from('surveys')
      .insert(surveyData)
      .select()
      .single();

    if (error) {
      console.error('Error adding survey:', error);
      throw error;
    }

    console.log('Survey added successfully:', data);
    return data;
  };

  const createSurveyLink = async (customerId: string) => {
    console.log('Creating survey link for customer:', customerId);
    
    const surveyToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const surveyData = {
      customer_id: customerId,
      deal_date: new Date().toISOString().split('T')[0],
      product_quality: 0,
      service_sales: 0,
      service_technician: 0,
      usage_clarity: 0,
      price_approval: false,
      is_completed: false,
      survey_token: surveyToken
    };

    const { data, error } = await supabase
      .from('surveys')
      .insert(surveyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating survey link:', error);
      throw error;
    }

    console.log('Survey link created successfully:', data);
    return data;
  };

  return {
    surveys: query.data || fallbackSurveys,
    loading: query.isLoading,
    error: query.error,
    getAverageRatings,
    addSurvey,
    createSurveyLink,
    ...query
  };
};

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (surveyData: Omit<Survey, 'id' | 'created_at' | 'customers'>) => {
      console.log('Creating survey:', surveyData);

      const { data, error } = await supabase
        .from('surveys')
        .insert(surveyData)
        .select()
        .single();

      if (error) {
        console.error('Error creating survey:', error);
        throw error;
      }

      console.log('Survey created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast({
        title: 'Sukses',
        description: 'Survei berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error in useCreateSurvey:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat survei',
        variant: 'destructive',
      });
    },
  });
};
