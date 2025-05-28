
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Survey } from '@/types/customer';

export const usePublicSurvey = (token: string) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select(`
            *,
            customers (
              name,
              phone
            )
          `)
          .eq('survey_token', token)
          .single();

        if (surveyError) {
          console.error('Error fetching survey:', surveyError);
          setError('Survei tidak ditemukan atau link tidak valid');
          return;
        }

        if (surveyData) {
          const transformedSurvey: Survey = {
            id: surveyData.id,
            customer_id: surveyData.customer_id,
            deal_date: surveyData.deal_date,
            service_technician: surveyData.service_technician,
            service_sales: surveyData.service_sales,
            product_quality: surveyData.product_quality,
            usage_clarity: surveyData.usage_clarity,
            price_approval: surveyData.price_approval,
            testimonial: surveyData.testimonial || '',
            suggestions: surveyData.suggestions || '',
            is_completed: surveyData.is_completed,
            completed_at: surveyData.completed_at,
            survey_token: surveyData.survey_token
          };

          setSurvey(transformedSurvey);
          setCustomer(surveyData.customers);
        }
      } catch (error) {
        console.error('Error in fetchSurvey:', error);
        setError('Terjadi kesalahan saat memuat survei');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSurvey();
    }
  }, [token]);

  const updateSurvey = async (updatedData: Partial<Survey>) => {
    try {
      const { error } = await supabase
        .from('surveys')
        .update({
          service_technician: updatedData.service_technician,
          service_sales: updatedData.service_sales,
          product_quality: updatedData.product_quality,
          usage_clarity: updatedData.usage_clarity,
          price_approval: updatedData.price_approval,
          testimonial: updatedData.testimonial,
          suggestions: updatedData.suggestions,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('survey_token', token);

      if (error) {
        console.error('Error updating survey:', error);
        throw error;
      }

      if (survey) {
        setSurvey({
          ...survey,
          ...updatedData,
          is_completed: true,
          completed_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in updateSurvey:', error);
      throw error;
    }
  };

  return {
    survey,
    customer,
    loading,
    error,
    updateSurvey
  };
};
