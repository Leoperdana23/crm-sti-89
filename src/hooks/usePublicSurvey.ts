
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
        console.log('Fetching survey with token:', token);

        if (!token) {
          setError('Token survei tidak valid');
          return;
        }

        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select(`
            *,
            customers (
              id,
              name,
              phone,
              birth_date,
              id_number,
              address
            )
          `)
          .eq('survey_token', token)
          .single();

        if (surveyError) {
          console.error('Error fetching survey:', surveyError);
          setError('Survei tidak ditemukan atau link tidak valid');
          return;
        }

        if (!surveyData) {
          setError('Survei tidak ditemukan');
          return;
        }

        console.log('Survey data fetched:', surveyData);

        const transformedSurvey: Survey = {
          id: surveyData.id,
          customer_id: surveyData.customer_id,
          deal_date: surveyData.deal_date,
          service_technician: surveyData.service_technician || 0,
          service_sales: surveyData.service_sales || 0,
          product_quality: surveyData.product_quality || 0,
          usage_clarity: surveyData.usage_clarity || 0,
          price_approval: surveyData.price_approval || false,
          testimonial: surveyData.testimonial || '',
          suggestions: surveyData.suggestions || '',
          is_completed: surveyData.is_completed || false,
          completed_at: surveyData.completed_at,
          survey_token: surveyData.survey_token
        };

        setSurvey(transformedSurvey);
        setCustomer(surveyData.customers);
      } catch (error) {
        console.error('Error in fetchSurvey:', error);
        setError('Terjadi kesalahan saat memuat survei');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSurvey();
    } else {
      setLoading(false);
      setError('Token survei tidak ditemukan');
    }
  }, [token]);

  // Simplified updateCustomer function (kept for compatibility but not used)
  const updateCustomer = async (customerData: { 
    name: string; 
    birth_date?: string; 
    id_number?: string;
    address?: string;
  }) => {
    // This function is kept for compatibility but not used in the simplified form
    console.log('Customer data update not needed in simplified form');
  };

  const updateSurvey = async (updatedData: Partial<Survey>) => {
    try {
      if (!survey) {
        throw new Error('Survey data tidak tersedia');
      }

      console.log('Updating survey data:', updatedData);

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

      // Update customer survey status
      await supabase
        .from('customers')
        .update({ survey_status: 'sudah_disurvei' })
        .eq('id', survey.customer_id);

      setSurvey({
        ...survey,
        ...updatedData,
        is_completed: true,
        completed_at: new Date().toISOString()
      });

      console.log('Survey updated successfully');
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
    updateCustomer,
    updateSurvey
  };
};
