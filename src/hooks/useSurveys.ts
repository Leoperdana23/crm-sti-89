
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

      const transformedSurveys: Survey[] = (data || []).map(survey => ({
        id: survey.id,
        customerId: survey.customer_id,
        dealDate: survey.deal_date,
        serviceTechnician: survey.service_technician,
        serviceSales: survey.service_sales,
        productQuality: survey.product_quality,
        usageClarity: survey.usage_clarity,
        priceApproval: survey.price_approval,
        testimonial: survey.testimonial || '',
        suggestions: survey.suggestions || '',
        isCompleted: survey.is_completed,
        completedAt: survey.completed_at,
        surveyToken: survey.survey_token
      }));

      setSurveys(transformedSurveys);
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
        const newSurvey: Survey = {
          id: data.id,
          customerId: data.customer_id,
          dealDate: data.deal_date,
          serviceTechnician: data.service_technician,
          serviceSales: data.service_sales,
          productQuality: data.product_quality,
          usageClarity: data.usage_clarity,
          priceApproval: data.price_approval,
          testimonial: data.testimonial || '',
          suggestions: data.suggestions || '',
          isCompleted: data.is_completed,
          completedAt: data.completed_at,
          surveyToken: data.survey_token
        };
        
        setSurveys(prev => [newSurvey, ...prev]);
        return newSurvey;
      }
    } catch (error) {
      console.error('Error in createSurveyLink:', error);
      throw error;
    }
  };

  const addSurvey = async (surveyData: Omit<Survey, 'id' | 'isCompleted' | 'completedAt' | 'surveyToken'>) => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .insert({
          customer_id: surveyData.customerId,
          deal_date: surveyData.dealDate,
          service_technician: surveyData.serviceTechnician,
          service_sales: surveyData.serviceSales,
          product_quality: surveyData.productQuality,
          usage_clarity: surveyData.usageClarity,
          price_approval: surveyData.priceApproval,
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
        const newSurvey: Survey = {
          id: data.id,
          customerId: data.customer_id,
          dealDate: data.deal_date,
          serviceTechnician: data.service_technician,
          serviceSales: data.service_sales,
          productQuality: data.product_quality,
          usageClarity: data.usage_clarity,
          priceApproval: data.price_approval,
          testimonial: data.testimonial || '',
          suggestions: data.suggestions || '',
          isCompleted: data.is_completed,
          completedAt: data.completed_at,
          surveyToken: data.survey_token
        };
        
        setSurveys(prev => [newSurvey, ...prev]);
        return newSurvey;
      }
    } catch (error) {
      console.error('Error in addSurvey:', error);
      throw error;
    }
  };

  const getAverageRatings = () => {
    if (surveys.length === 0) return null;

    const completedSurveys = surveys.filter(s => s.isCompleted);
    if (completedSurveys.length === 0) return null;

    return {
      serviceTechnician: completedSurveys.reduce((sum, s) => sum + s.serviceTechnician, 0) / completedSurveys.length,
      serviceSales: completedSurveys.reduce((sum, s) => sum + s.serviceSales, 0) / completedSurveys.length,
      productQuality: completedSurveys.reduce((sum, s) => sum + s.productQuality, 0) / completedSurveys.length,
      usageClarity: completedSurveys.reduce((sum, s) => sum + s.usageClarity, 0) / completedSurveys.length,
      priceApprovalRate: (completedSurveys.filter(s => s.priceApproval).length / completedSurveys.length) * 100
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
