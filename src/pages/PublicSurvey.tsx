
import React from 'react';
import { useParams } from 'react-router-dom';
import { usePublicSurvey } from '@/hooks/usePublicSurvey';
import PublicSurveyForm from '@/components/PublicSurveyForm';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

const PublicSurveyContent = () => {
  const { token } = useParams<{ token: string }>();
  
  console.log('PublicSurvey component rendered with token:', token);
  
  const { survey, customer, loading, error, updateCustomer, updateSurvey } = usePublicSurvey(token || '');

  const handleSurveySubmit = async (surveyData: any) => {
    try {
      console.log('Submitting survey data:', surveyData);
      await updateSurvey(surveyData);
    } catch (error) {
      console.error('Error submitting survey:', error);
      throw error;
    }
  };

  console.log('Survey state:', { survey, customer, loading, error });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-lg">Memuat survei...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error('Survey error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md md:max-w-lg mx-auto shadow-lg">
          <CardHeader className="text-center bg-red-50">
            <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-lg md:text-xl text-red-600">Survei Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-4 md:p-6">
            <p className="text-sm md:text-base text-gray-600 mb-4">
              {error || 'Link survei tidak valid atau sudah tidak aktif.'}
            </p>
            <p className="text-xs text-gray-500">
              Silakan hubungi customer service kami jika Anda memerlukan bantuan.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    console.warn('No survey data available');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md md:max-w-lg mx-auto shadow-lg">
          <CardHeader className="text-center bg-yellow-50">
            <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-lg md:text-xl text-yellow-600">Data Survei Tidak Tersedia</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-4 md:p-6">
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Data survei tidak dapat dimuat. Silakan coba lagi nanti.
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
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto">
            Mohon berikan penilaian Anda terhadap layanan kami untuk membantu meningkatkan kualitas pelayanan.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 lg:p-8">
          <PublicSurveyForm
            survey={survey}
            customer={customer || {}}
            onSubmit={handleSurveySubmit}
            onUpdateCustomer={updateCustomer}
            isCompleted={survey.is_completed || false}
          />
        </div>
      </div>
    </div>
  );
};

const PublicSurvey = () => {
  return (
    <ErrorBoundary>
      <PublicSurveyContent />
    </ErrorBoundary>
  );
};

export default PublicSurvey;
