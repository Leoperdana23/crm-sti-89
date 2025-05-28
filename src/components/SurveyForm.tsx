
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
  onSubmit: (surveyData: Omit<Survey, 'id' | 'isCompleted' | 'completedAt'>) => Promise<void>;
  onCancel: () => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    serviceTechnician: 5,
    serviceSales: 5,
    productQuality: 5,
    usageClarity: 5,
    priceApproval: true,
    testimonial: '',
    suggestions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const surveyData = {
      customerId: customer.id,
      dealDate: customer.dealDate || new Date().toISOString().split('T')[0],
      ...formData
    };

    await onSubmit(surveyData);
  };

  const renderRatingScale = (field: keyof typeof formData, label: string) => {
    if (typeof formData[field] !== 'number') return null;
    
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">{label}</Label>
        <RadioGroup
          value={formData[field].toString()}
          onValueChange={(value) => setFormData(prev => ({ ...prev, [field]: parseInt(value) }))}
          className="flex flex-wrap gap-2"
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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Survei Kepuasan Pelanggan</CardTitle>
        <p className="text-gray-600">Pelanggan: {customer.name}</p>
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

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1">
              Simpan Survei
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SurveyForm;
