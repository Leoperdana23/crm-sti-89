
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
  serviceTechnician: number | null;
  serviceSales: number | null;
  productQuality: number | null;
  usageClarity: number | null;
  priceApproval: boolean | null;
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
    serviceTechnician: isCompleted ? survey.serviceTechnician || null : null,
    serviceSales: isCompleted ? survey.serviceSales || null : null,
    productQuality: isCompleted ? survey.productQuality || null : null,
    usageClarity: isCompleted ? survey.usageClarity || null : null,
    priceApproval: isCompleted ? (survey.priceApproval !== undefined ? survey.priceApproval : null) : null,
    testimonial: survey.testimonial || '',
    suggestions: survey.suggestions || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.serviceTechnician === null) {
      newErrors.serviceTechnician = 'Harap pilih rating untuk Pelayanan Teknisi';
    }
    if (formData.serviceSales === null) {
      newErrors.serviceSales = 'Harap pilih rating untuk Pelayanan Sales/CS';
    }
    if (formData.productQuality === null) {
      newErrors.productQuality = 'Harap pilih rating untuk Kualitas Produk';
    }
    if (formData.usageClarity === null) {
      newErrors.usageClarity = 'Harap pilih rating untuk Kejelasan Penggunaan';
    }
    if (formData.priceApproval === null) {
      newErrors.priceApproval = 'Harap pilih apakah harga sesuai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCompleted) return;

    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const submitData = {
        ...formData,
        serviceTechnician: formData.serviceTechnician!,
        serviceSales: formData.serviceSales!,
        productQuality: formData.productQuality!,
        usageClarity: formData.usageClarity!,
        priceApproval: formData.priceApproval!,
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingScale = (field: keyof FormData, label: string) => {
    const fieldValue = formData[field];
    const hasError = errors[field];
    
    return (
      <div className="space-y-3">
        <Label className={`text-sm font-medium ${hasError ? 'text-red-600' : ''}`}>
          {label} <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={fieldValue?.toString() || ''}
          onValueChange={(value) => {
            setFormData(prev => ({ ...prev, [field]: parseInt(value) }));
            if (errors[field]) {
              setErrors(prev => ({ ...prev, [field]: '' }));
            }
          }}
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
        {hasError && (
          <p className="text-red-600 text-sm mt-1">{hasError}</p>
        )}
      </div>
    );
  };

  const isFormValid = () => {
    return formData.serviceTechnician !== null &&
           formData.serviceSales !== null &&
           formData.productQuality !== null &&
           formData.usageClarity !== null &&
           formData.priceApproval !== null;
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
        <p className="text-sm text-red-600">
          * Wajib diisi
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderRatingScale('serviceTechnician', 'Pelayanan Teknisi (1-10)')}
          {renderRatingScale('serviceSales', 'Pelayanan Sales/CS (1-10)')}
          {renderRatingScale('productQuality', 'Kualitas Produk (1-10)')}
          {renderRatingScale('usageClarity', 'Kejelasan Penggunaan (1-10)')}

          <div className="space-y-3">
            <Label className={`text-sm font-medium ${errors.priceApproval ? 'text-red-600' : ''}`}>
              Harga Sesuai? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.priceApproval !== null ? formData.priceApproval.toString() : ''}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, priceApproval: value === 'true' }));
                if (errors.priceApproval) {
                  setErrors(prev => ({ ...prev, priceApproval: '' }));
                }
              }}
              className="flex gap-4"
              disabled={isCompleted}
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
            {errors.priceApproval && (
              <p className="text-red-600 text-sm mt-1">{errors.priceApproval}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial">Testimoni</Label>
            <Textarea
              id="testimonial"
              value={formData.testimonial}
              onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
              placeholder="Bagikan pengalaman Anda dengan produk/layanan kami..."
              rows={4}
              disabled={isCompleted}
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
              disabled={isCompleted}
            />
          </div>

          <Button 
            type="submit" 
            className={`w-full ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Survei'}
          </Button>
          
          {!isFormValid() && (
            <p className="text-red-600 text-sm text-center mt-2">
              Harap isi semua rating yang wajib diisi sebelum mengirim survei
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PublicSurveyForm;
