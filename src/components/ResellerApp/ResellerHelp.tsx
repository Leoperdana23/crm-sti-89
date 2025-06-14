
import React from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, HelpCircle, ExternalLink } from 'lucide-react';
import { useContactSettings } from '@/hooks/useContactSettings';
import { useFAQItems } from '@/hooks/useFAQ';
import { useUsageTips } from '@/hooks/useUsageTips';

interface ResellerHelpProps {
  reseller: ResellerSession;
}

const ResellerHelp: React.FC<ResellerHelpProps> = ({ reseller }) => {
  const { data: contactSettings } = useContactSettings();
  const { data: faqItems = [] } = useFAQItems();
  const { data: usageTips = [] } = useUsageTips();

  const handleWhatsAppContact = () => {
    const adminPhone = contactSettings?.whatsapp_number || '6281234567890';
    const cleanPhone = adminPhone.replace(/\D/g, '');
    const message = encodeURIComponent(`Halo Admin, saya ${reseller.name} (${reseller.phone}) membutuhkan bantuan dengan aplikasi reseller.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleEmailContact = () => {
    const adminEmail = contactSettings?.email || 'admin@company.com';
    const subject = encodeURIComponent('Bantuan Aplikasi Reseller');
    const body = encodeURIComponent(`Halo Admin,\n\nSaya ${reseller.name} (${reseller.phone}) membutuhkan bantuan dengan aplikasi reseller.\n\nTerima kasih.`);
    window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handlePhoneContact = () => {
    const adminPhone = contactSettings?.phone_number || '+6281234567890';
    window.open(`tel:${adminPhone}`, '_self');
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Bantuan</h2>

      {/* Contact Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Hubungi Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full justify-start bg-green-600 hover:bg-green-700"
            onClick={handleWhatsAppContact}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat WhatsApp Admin
            <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
          
          <Button 
            variant="outline"
            className="w-full justify-start"
            onClick={handleEmailContact}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Admin
            <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>

          <Button 
            variant="outline"
            className="w-full justify-start"
            onClick={handlePhoneContact}
          >
            <Phone className="h-4 w-4 mr-2" />
            Telepon Admin
          </Button>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Pertanyaan Umum (FAQ)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.filter(item => item.is_active).map((item) => (
            <div key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <h4 className="font-medium text-sm mb-2">{item.question}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Aplikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Versi Aplikasi:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ID Reseller:</span>
            <span className="font-mono">{reseller.id.slice(-8)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Terakhir Login:</span>
            <span>{new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips Penggunaan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            {usageTips.filter(tip => tip.is_active).map((tip) => (
              <li key={tip.id}>• {tip.description}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellerHelp;
