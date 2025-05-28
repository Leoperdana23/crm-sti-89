
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
  service_technician: number | null;
  service_sales: number | null;
  product_quality: number | null;
  usage_clarity: number | null;
  price_approval: boolean | null;
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
    service_technician: isCompleted ? survey.service_technician || null : null,
    service_sales: isCompleted ? survey.service_sales || null : null,
    product_quality: isCompleted ? survey.product_quality || null : null,
    usage_clarity: isCompleted ? survey.usage_clarity || null : null,
    price_approval: isCompleted ? (survey.price_approval !== undefined ? survey.price_approval : null) : null,
    testimonial: survey.testimonial || '',
    suggestions: survey.suggestions || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.service_technician === null) {
      newErrors.service_technician = 'Harap pilih rating untuk Pelayanan Teknisi';
    }
    if (formData.service_sales === null) {
      newErrors.service_sales = 'Harap pilih rating untuk Pelayanan Sales/CS';
    }
    if (formData.product_quality === null) {
      newErrors.product_quality = 'Harap pilih rating untuk Kualitas Produk';
    }
    if (formData.usage_clarity === null) {
      newErrors.usage_clarity = 'Harap pilih rating untuk Kejelasan Penggunaan';
    }
    if (formData.price_approval === null) {
      newErrors.price_approval = 'Harap pilih apakah harga sesuai';
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
        service_technician: formData.service_technician!,
        service_sales: formData.service_sales!,
        product_quality: formData.product_quality!,
        usage_clarity: formData.usage_clarity!,
        price_approval: formData.price_approval!,
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
    return formData.service_technician !== null &&
           formData.service_sales !== null &&
           formData.product_quality !== null &&
           formData.usage_clarity !== null &&
           formData.price_approval !== null;
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
          {renderRatingScale('service_technician', 'Pelayanan Teknisi (1-10)')}
          {renderRatingScale('service_sales', 'Pelayanan Sales/CS (1-10)')}
          {renderRatingScale('product_quality', 'Kualitas Produk (1-10)')}
          {renderRatingScale('usage_clarity', 'Kejelasan Penggunaan (1-10)')}

          <div className="space-y-3">
            <Label className={`text-sm font-medium ${errors.price_approval ? 'text-red-600' : ''}`}>
              Harga Sesuai? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.price_approval !== null ? formData.price_approval.toString() : ''}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, price_approval: value === 'true' }));
                if (errors.price_approval) {
                  setErrors(prev => ({ ...prev, price_approval: '' }));
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
            {errors.price_approval && (
              <p className="text-red-600 text-sm mt-1">{errors.price_approval}</p>
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
