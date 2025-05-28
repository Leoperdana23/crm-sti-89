
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
            customerId: surveyData.customer_id,
            dealDate: surveyData.deal_date,
            serviceTechnician: surveyData.service_technician,
            serviceSales: surveyData.service_sales,
            productQuality: surveyData.product_quality,
            usageClarity: surveyData.usage_clarity,
            priceApproval: surveyData.price_approval,
            testimonial: surveyData.testimonial || '',
            suggestions: surveyData.suggestions || '',
            isCompleted: surveyData.is_completed,
            completedAt: surveyData.completed_at,
            surveyToken: surveyData.survey_token
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
          service_technician: updatedData.serviceTechnician,
          service_sales: updatedData.serviceSales,
          product_quality: updatedData.productQuality,
          usage_clarity: updatedData.usageClarity,
          price_approval: updatedData.priceApproval,
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
          isCompleted: true,
          completedAt: new Date().toISOString()
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
