
import React from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, HelpCircle, ExternalLink } from 'lucide-react';

interface ResellerHelpProps {
  reseller: ResellerSession;
}

const ResellerHelp: React.FC<ResellerHelpProps> = ({ reseller }) => {
  const handleWhatsAppContact = () => {
    const adminPhone = '6281234567890'; // Replace with actual admin phone
    const message = encodeURIComponent(`Halo Admin, saya ${reseller.name} (${reseller.phone}) membutuhkan bantuan dengan aplikasi reseller.`);
    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent('Bantuan Aplikasi Reseller');
    const body = encodeURIComponent(`Halo Admin,\n\nSaya ${reseller.name} (${reseller.phone}) membutuhkan bantuan dengan aplikasi reseller.\n\nTerima kasih.`);
    window.open(`mailto:admin@company.com?subject=${subject}&body=${body}`, '_blank');
  };

  const faqItems = [
    {
      question: 'Bagaimana cara mendapatkan link reseller?',
      answer: 'Link reseller akan diberikan oleh admin setelah akun Anda diaktivasi. Anda bisa menghubungi admin untuk mendapatkan link tersebut.'
    },
    {
      question: 'Kapan komisi dibayarkan?',
      answer: 'Komisi biasanya dibayarkan setiap akhir bulan setelah semua order selesai dan confirmed.'
    },
    {
      question: 'Bagaimana cara tracking order customer?',
      answer: 'Anda bisa melihat semua order yang masuk melalui link reseller Anda di menu "Order". Status akan diupdate secara real-time.'
    },
    {
      question: 'Apakah ada minimal order untuk mendapat komisi?',
      answer: 'Tidak ada minimal order. Setiap order yang berhasil akan mendapatkan komisi sesuai rate yang telah ditentukan.'
    },
    {
      question: 'Bagaimana cara mengubah password?',
      answer: 'Anda bisa mengubah password di menu Profil > Keamanan > Ubah Password, atau hubungi admin untuk reset password.'
    }
  ];

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
            onClick={() => window.open('tel:+6281234567890', '_self')}
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
          {faqItems.map((item, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
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
            <li>• Bagikan link reseller Anda ke calon customer</li>
            <li>• Cek riwayat order secara berkala untuk tracking komisi</li>
            <li>• Update profil Anda agar informasi selalu terbaru</li>
            <li>• Hubungi admin jika ada kendala teknis</li>
            <li>• Manfaatkan katalog untuk promosi produk</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellerHelp;
