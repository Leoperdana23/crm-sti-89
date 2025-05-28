
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span>Memuat survei...</span>
        </div>
      </div>
    );
  }

  if (error || !survey || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Survei Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              {error || 'Link survei tidak valid atau sudah tidak aktif.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Survei Kepuasan Pelanggan
          </h1>
          <p className="text-gray-600">
            Kami menghargai feedback Anda untuk meningkatkan kualitas layanan
          </p>
        </div>
        
        <PublicSurveyForm
          survey={survey}
          customerName={customer.name}
          onSubmit={handleSurveySubmit}
          isCompleted={survey.isCompleted}
        />
      </div>
    </div>
  );
};

export default PublicSurvey;
