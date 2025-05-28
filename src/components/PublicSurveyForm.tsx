
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Survey } from '@/types/customer';
import { CheckCircle } from 'lucide-react';

interface PublicSurveyFormProps {
  survey: Survey;
  customerName: string;
  onSubmit: (surveyData: Partial<Survey>) => Promise<void>;
  isCompleted?: boolean;
}

interface FormData {
  serviceTechnician: number;
  serviceSales: number;
  productQuality: number;
  usageClarity: number;
  priceApproval: boolean;
  testimonial: string;
  suggestions: string;
}

const PublicSurveyForm: React.FC<PublicSurveyFormProps> = ({ 
  survey, 
  customerName, 
  onSubmit, 
  isCompleted = false 
}) => {
  const [formData, setFormData] = useState<FormData>({
    serviceTechnician: survey.serviceTechnician || 5,
    serviceSales: survey.serviceSales || 5,
    productQuality: survey.productQuality || 5,
    usageClarity: survey.usageClarity || 5,
    priceApproval: survey.priceApproval !== undefined ? survey.priceApproval : true,
    testimonial: survey.testimonial || '',
    suggestions: survey.suggestions || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCompleted) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingScale = (field: keyof FormData, label: string) => {
    if (typeof formData[field] !== 'number') return null;
    
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">{label}</Label>
        <RadioGroup
          value={formData[field].toString()}
          onValueChange={(value) => setFormData(prev => ({ ...prev, [field]: parseInt(value) }))}
          className="flex flex-wrap gap-2"
          disabled={isCompleted}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <div key={num} className="flex items-center space-x-1">
              <RadioGroupItem value={num.toString()} id={`${field}-${num}`} />
              <Label htmlFor={`${field}-${num}`} className="text-sm">{num}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-green-600">Terima Kasih!</CardTitle>
          <p className="text-gray-600">Survei Anda telah berhasil dikirim</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-700">
            Terima kasih atas waktu dan masukan yang Anda berikan. 
            Feedback Anda sangat berharga untuk meningkatkan kualitas layanan kami.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Survei Kepuasan Pelanggan</CardTitle>
        <p className="text-gray-600">Pelanggan: {customerName}</p>
        <p className="text-sm text-gray-500">
          Mohon berikan penilaian Anda terhadap layanan kami. Skala 1 (sangat buruk) hingga 10 (sangat baik).
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderRatingScale('serviceTechnician', 'Pelayanan Teknisi (1-10)')}
          {renderRatingScale('serviceSales', 'Pelayanan Sales/CS (1-10)')}
          {renderRatingScale('productQuality', 'Kualitas Produk (1-10)')}
          {renderRatingScale('usageClarity', 'Kejelasan Penggunaan (1-10)')}

          <div className="space-y-3">
            <Label className="text-sm font-medium">Harga Sesuai?</Label>
            <RadioGroup
              value={formData.priceApproval.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priceApproval: value === 'true' }))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="price-yes" />
                <Label htmlFor="price-yes">Ya, Sesuai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="price-no" />
                <Label htmlFor="price-no">Tidak Sesuai</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial">Testimoni</Label>
            <Textarea
              id="testimonial"
              value={formData.testimonial}
              onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
              placeholder="Bagikan pengalaman Anda dengan produk/layanan kami..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestions">Saran dan Kritik</Label>
            <Textarea
              id="suggestions"
              value={formData.suggestions}
              onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
              placeholder="Berikan saran atau kritik untuk perbaikan layanan kami..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Survei'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PublicSurveyForm;
