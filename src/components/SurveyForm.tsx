
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Customer, Survey } from '@/types/customer';

interface SurveyFormProps {
  customer: Customer;
  onSubmit: (surveyData: Omit<Survey, 'id' | 'is_completed' | 'completed_at' | 'survey_token'>) => Promise<void>;
  onCancel: () => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    service_technician: 5,
    service_sales: 5,
    product_quality: 5,
    usage_clarity: 5,
    price_approval: true,
    testimonial: '',
    suggestions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const surveyData = {
      customer_id: customer.id,
      deal_date: customer.deal_date || new Date().toISOString().split('T')[0],
      ...formData
    };

    await onSubmit(surveyData);
  };

  const renderRatingScale = (field: keyof typeof formData, label: string) => {
    if (typeof formData[field] !== 'number') return null;
    
    return (
      <div className="space-y-3">
        <Label className="text-sm md:text-base font-medium">{label}</Label>
        <RadioGroup
          value={formData[field].toString()}
          onValueChange={(value) => setFormData(prev => ({ ...prev, [field]: parseInt(value) }))}
          className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
            <div key={num} className="flex flex-col items-center space-y-1">
              <RadioGroupItem value={num.toString()} id={`${field}-${num}`} className="mx-auto" />
              <Label htmlFor={`${field}-${num}`} className="text-xs md:text-sm cursor-pointer">{num}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-lg md:text-xl lg:text-2xl">Survei Kepuasan Pelanggan</CardTitle>
          <p className="text-sm md:text-base text-gray-600 mt-2">Pelanggan: <span className="font-semibold">{customer.name}</span></p>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6">
                {renderRatingScale('service_technician', 'Pelayanan Teknisi (1-10)')}
                {renderRatingScale('service_sales', 'Pelayanan Sales/CS (1-10)')}
              </div>
              
              <div className="space-y-6">
                {renderRatingScale('product_quality', 'Kualitas Produk (1-10)')}
                {renderRatingScale('usage_clarity', 'Kejelasan Penggunaan (1-10)')}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="space-y-4">
                <Label className="text-sm md:text-base font-medium">Harga Sesuai?</Label>
                <RadioGroup
                  value={formData.price_approval.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, price_approval: value === 'true' }))}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-green-50 transition-colors">
                    <RadioGroupItem value="true" id="price-yes" />
                    <Label htmlFor="price-yes" className="text-sm md:text-base cursor-pointer flex-1">Ya, Sesuai</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-red-50 transition-colors">
                    <RadioGroupItem value="false" id="price-no" />
                    <Label htmlFor="price-no" className="text-sm md:text-base cursor-pointer flex-1">Tidak Sesuai</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="testimonial" className="text-sm md:text-base font-medium">Testimoni</Label>
                <Textarea
                  id="testimonial"
                  value={formData.testimonial}
                  onChange={(e) => setFormData(prev => ({ ...prev, testimonial: e.target.value }))}
                  placeholder="Bagikan pengalaman Anda dengan produk/layanan kami..."
                  rows={4}
                  className="text-sm md:text-base"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="suggestions" className="text-sm md:text-base font-medium">Saran dan Kritik</Label>
                <Textarea
                  id="suggestions"
                  value={formData.suggestions}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
                  placeholder="Berikan saran atau kritik untuk perbaikan layanan kami..."
                  rows={4}
                  className="text-sm md:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 border-t">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm md:text-base py-2 md:py-3"
              >
                Simpan Survei
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="flex-1 text-sm md:text-base py-2 md:py-3 hover:bg-gray-50"
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyForm;
