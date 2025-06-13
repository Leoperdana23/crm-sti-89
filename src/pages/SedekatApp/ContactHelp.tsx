
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  HelpCircle, 
  Plus,
  Edit,
  Trash2,
  Send,
  Users
} from 'lucide-react';

const ContactHelp = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  // Mock data - replace with real data
  const contactSettings = {
    whatsapp: '+62812345678',
    email: 'admin@sedekatapp.com',
    phone: '+62218765432'
  };

  const faqData = [
    {
      id: 1,
      question: 'Bagaimana cara menjadi reseller?',
      answer: 'Untuk menjadi reseller, silakan hubungi admin melalui WhatsApp atau email.',
      category: 'Reseller',
      isActive: true
    },
    {
      id: 2,
      question: 'Bagaimana cara melakukan pemesanan?',
      answer: 'Anda dapat melakukan pemesanan melalui aplikasi atau menghubungi admin.',
      category: 'Pemesanan',
      isActive: true
    },
    {
      id: 3,
      question: 'Berapa lama proses pengiriman?',
      answer: 'Proses pengiriman biasanya memakan waktu 2-3 hari kerja.',
      category: 'Pengiriman',
      isActive: true
    }
  ];

  const handleEditFaq = (faq: any) => {
    setEditingFaq(faq);
    setIsDialogOpen(true);
  };

  const handleAddFaq = () => {
    setEditingFaq(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kontak & Bantuan</h1>
        <p className="text-gray-600">Kelola kontak admin dan FAQ</p>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact">Kontak Admin</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tips">Tips Penggunaan</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Pengaturan Kontak Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Nomor WhatsApp Admin
                </label>
                <Input
                  defaultValue={contactSettings.whatsapp}
                  placeholder="+62812345678"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Admin
                </label>
                <Input
                  type="email"
                  defaultValue={contactSettings.email}
                  placeholder="admin@sedekatapp.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Nomor Telepon
                </label>
                <Input
                  defaultValue={contactSettings.phone}
                  placeholder="+62218765432"
                />
              </div>

              <Button>
                <Phone className="h-4 w-4 mr-2" />
                Simpan Kontak
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddFaq}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah FAQ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pertanyaan</label>
                    <Input placeholder="Masukkan pertanyaan..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jawaban</label>
                    <Textarea placeholder="Masukkan jawaban..." rows={4} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option>Reseller</option>
                      <option>Pemesanan</option>
                      <option>Pengiriman</option>
                      <option>Pembayaran</option>
                    </select>
                  </div>
                  <Button className="w-full">Simpan FAQ</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pertanyaan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqData.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{faq.question}</p>
                          <p className="text-sm text-gray-600 truncate max-w-md">
                            {faq.answer}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{faq.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={faq.isActive ? 'default' : 'secondary'}>
                          {faq.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditFaq(faq)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Tips Penggunaan Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Tip 1: Cara Login</h4>
                  <p className="text-blue-700 text-sm">
                    Gunakan nomor HP dan password yang telah didaftarkan untuk masuk ke aplikasi.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Tip 2: Melihat Katalog</h4>
                  <p className="text-green-700 text-sm">
                    Browse produk dengan mudah melalui menu katalog dan gunakan filter untuk pencarian yang lebih spesifik.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800">Tip 3: Melakukan Pemesanan</h4>
                  <p className="text-purple-700 text-sm">
                    Pilih produk, masukkan jumlah, isi data customer, dan submit pesanan Anda.
                  </p>
                </div>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Tips Baru
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Broadcast Informasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Judul Broadcast</label>
                <Input placeholder="Masukkan judul..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pesan</label>
                <Textarea placeholder="Masukkan pesan broadcast..." rows={4} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Penerima</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span>Semua Reseller</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span>Reseller Aktif</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span>Customer</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Channel</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <Users className="h-4 w-4" />
                    <span>Push Notification</span>
                  </label>
                </div>
              </div>

              <Button>
                <Send className="h-4 w-4 mr-2" />
                Kirim Broadcast
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactHelp;
