
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Survey } from '@/types/customer';

export const useSurveys = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
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
        return;
      }

      // Use the data directly as it already matches the Survey interface with snake_case
      setSurveys(data || []);
    } catch (error) {
      console.error('Error in fetchSurveys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const createSurveyLink = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert({
          customer_id: customerId,
          deal_date: new Date().toISOString().split('T')[0],
          service_technician: 1,
          service_sales: 1,
          product_quality: 1,
          usage_clarity: 1,
          price_approval: false,
          testimonial: '',
          suggestions: '',
          is_completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating survey link:', error);
        throw error;
      }

      if (data) {
        setSurveys(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error in createSurveyLink:', error);
      throw error;
    }
  };

  const addSurvey = async (surveyData: Omit<Survey, 'id' | 'is_completed' | 'completed_at' | 'survey_token'>) => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert({
          customer_id: surveyData.customer_id,
          deal_date: surveyData.deal_date,
          service_technician: surveyData.service_technician,
          service_sales: surveyData.service_sales,
          product_quality: surveyData.product_quality,
          usage_clarity: surveyData.usage_clarity,
          price_approval: surveyData.price_approval,
          testimonial: surveyData.testimonial,
          suggestions: surveyData.suggestions,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding survey:', error);
        throw error;
      }

      if (data) {
        setSurveys(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error in addSurvey:', error);
      throw error;
    }
  };

  const getAverageRatings = () => {
    if (surveys.length === 0) return null;

    const completedSurveys = surveys.filter(s => s.is_completed);
    if (completedSurveys.length === 0) return null;

    return {
      serviceTechnician: completedSurveys.reduce((sum, s) => sum + s.service_technician, 0) / completedSurveys.length,
      serviceSales: completedSurveys.reduce((sum, s) => sum + s.service_sales, 0) / completedSurveys.length,
      productQuality: completedSurveys.reduce((sum, s) => sum + s.product_quality, 0) / completedSurveys.length,
      usageClarity: completedSurveys.reduce((sum, s) => sum + s.usage_clarity, 0) / completedSurveys.length,
      priceApprovalRate: (completedSurveys.filter(s => s.price_approval).length / completedSurveys.length) * 100
    };
  };

  return {
    surveys,
    loading,
    addSurvey,
    createSurveyLink,
    getAverageRatings,
    refreshSurveys: fetchSurveys
  };
};
