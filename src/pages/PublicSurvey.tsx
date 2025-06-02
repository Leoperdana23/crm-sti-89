
import React from 'react';
import { useParams } from 'react-router-dom';
import { usePublicSurvey } from '@/hooks/usePublicSurvey';
import PublicSurveyForm from '@/components/PublicSurveyForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const PublicSurvey = () => {
  const { token } = useParams<{ token: string }>();
  const { survey, customer, loading, error, updateSurvey } = usePublicSurvey(token || '');

  const handleSurveySubmit = async (surveyData: any) => {
    try {
      await updateSurvey(surveyData);
    } catch (error) {
      console.error('Error submitting survey:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 md:h-8 md:w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="text-sm md:text-base lg:text-lg">Memuat survei...</span>
        </div>
      </div>
    );
  }

  if (error || !survey || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md md:max-w-lg mx-auto shadow-lg">
          <CardHeader className="text-center bg-red-50">
            <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-lg md:text-xl text-red-600">Survei Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-4 md:p-6">
            <p className="text-sm md:text-base text-gray-600">
              {error || 'Link survei tidak valid atau sudah tidak aktif.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 md:py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Survei Kepuasan Pelanggan
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Kami menghargai feedback Anda untuk meningkatkan kualitas layanan
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 lg:p-8">
          <PublicSurveyForm
            survey={survey}
            customerName={customer.name}
            onSubmit={handleSurveySubmit}
            isCompleted={survey.is_completed}
          />
        </div>
      </div>
    </div>
  );
};

export default PublicSurvey;
