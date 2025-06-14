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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useContactSettings, useUpdateContactSettings } from '@/hooks/useContactSettings';
import { useFAQItems, useCreateFAQ, useUpdateFAQ, useDeleteFAQ } from '@/hooks/useFAQ';
import { useUsageTips, useCreateUsageTip, useUpdateUsageTip, useDeleteUsageTip } from '@/hooks/useUsageTips';
import { useCreateBroadcast } from '@/hooks/useBroadcast';

const ContactHelp = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<any>(null);
  
  // Form states
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'General'
  });
  
  const [tipForm, setTipForm] = useState({
    title: '',
    description: '',
    category: 'General'
  });
  
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    target_audience: [] as string[],
    channels: [] as string[]
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    whatsapp_number: '',
    email: '',
    phone_number: ''
  });

  // Hooks
  const { data: contactSettings, isLoading: contactLoading } = useContactSettings();
  const updateContactSettings = useUpdateContactSettings();
  const { data: faqItems = [], isLoading: faqLoading } = useFAQItems();
  const createFAQ = useCreateFAQ();
  const updateFAQ = useUpdateFAQ();
  const deleteFAQ = useDeleteFAQ();
  const { data: usageTips = [], isLoading: tipsLoading } = useUsageTips();
  const createUsageTip = useCreateUsageTip();
  const updateUsageTip = useUpdateUsageTip();
  const deleteUsageTip = useDeleteUsageTip();
  const createBroadcast = useCreateBroadcast();

  // Load contact settings into form
  React.useEffect(() => {
    if (contactSettings) {
      setContactForm({
        whatsapp_number: contactSettings.whatsapp_number || '',
        email: contactSettings.email || '',
        phone_number: contactSettings.phone_number || ''
      });
    }
  }, [contactSettings]);

  const handleSaveContact = async () => {
    try {
      await updateContactSettings.mutateAsync(contactForm);
    } catch (error) {
      console.error('Failed to save contact settings:', error);
    }
  };

  const handleEditFaq = (faq: any) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    });
    setIsDialogOpen(true);
  };

  const handleAddFaq = () => {
    setEditingFaq(null);
    setFaqForm({
      question: '',
      answer: '',
      category: 'General'
    });
    setIsDialogOpen(true);
  };

  const handleSaveFaq = async () => {
    try {
      if (editingFaq) {
        await updateFAQ.mutateAsync({
          id: editingFaq.id,
          ...faqForm
        });
      } else {
        await createFAQ.mutateAsync({
          ...faqForm,
          is_active: true,
          sort_order: 0
        });
      }
      setIsDialogOpen(false);
      setEditingFaq(null);
    } catch (error) {
      console.error('Failed to save FAQ:', error);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) {
      try {
        await deleteFAQ.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete FAQ:', error);
      }
    }
  };

  const handleEditTip = (tip: any) => {
    setEditingTip(tip);
    setTipForm({
      title: tip.title,
      description: tip.description,
      category: tip.category
    });
    setIsTipDialogOpen(true);
  };

  const handleAddTip = () => {
    setEditingTip(null);
    setTipForm({
      title: '',
      description: '',
      category: 'General'
    });
    setIsTipDialogOpen(true);
  };

  const handleSaveTip = async () => {
    try {
      if (editingTip) {
        await updateUsageTip.mutateAsync({
          id: editingTip.id,
          ...tipForm
        });
      } else {
        await createUsageTip.mutateAsync({
          ...tipForm,
          is_active: true,
          sort_order: 0
        });
      }
      setIsTipDialogOpen(false);
      setEditingTip(null);
    } catch (error) {
      console.error('Failed to save tip:', error);
    }
  };

  const handleDeleteTip = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tips ini?')) {
      try {
        await deleteUsageTip.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete tip:', error);
      }
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.message || broadcastForm.target_audience.length === 0 || broadcastForm.channels.length === 0) {
      alert('Mohon lengkapi semua field broadcast');
      return;
    }

    try {
      await createBroadcast.mutateAsync({
        title: broadcastForm.title,
        message: broadcastForm.message,
        target_audience: broadcastForm.target_audience,
        channels: broadcastForm.channels
      });
      setBroadcastForm({
        title: '',
        message: '',
        target_audience: [],
        channels: []
      });
    } catch (error) {
      console.error('Failed to send broadcast:', error);
    }
  };

  const handleTargetAudienceChange = (value: string, checked: boolean) => {
    setBroadcastForm(prev => ({
      ...prev,
      target_audience: checked 
        ? [...prev.target_audience, value]
        : prev.target_audience.filter(item => item !== value)
    }));
  };

  const handleChannelChange = (value: string, checked: boolean) => {
    setBroadcastForm(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, value]
        : prev.channels.filter(item => item !== value)
    }));
  };

  if (contactLoading || faqLoading || tipsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
                  value={contactForm.whatsapp_number}
                  onChange={(e) => setContactForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
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
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@sedekatapp.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Nomor Telepon
                </label>
                <Input
                  value={contactForm.phone_number}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+62218765432"
                />
              </div>

              <Button onClick={handleSaveContact} disabled={updateContactSettings.isPending}>
                <Phone className="h-4 w-4 mr-2" />
                {updateContactSettings.isPending ? 'Menyimpan...' : 'Simpan Kontak'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
            <Button onClick={handleAddFaq}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah FAQ
            </Button>
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
                  {faqItems.map((faq) => (
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
                        <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                          {faq.is_active ? 'Aktif' : 'Nonaktif'}
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
                            onClick={() => handleDeleteFaq(faq.id)}
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pertanyaan</label>
                  <Input 
                    placeholder="Masukkan pertanyaan..." 
                    value={faqForm.question}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jawaban</label>
                  <Textarea 
                    placeholder="Masukkan jawaban..." 
                    rows={4} 
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <Select value={faqForm.category} onValueChange={(value) => setFaqForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Reseller">Reseller</SelectItem>
                      <SelectItem value="Pemesanan">Pemesanan</SelectItem>
                      <SelectItem value="Pengiriman">Pengiriman</SelectItem>
                      <SelectItem value="Pembayaran">Pembayaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSaveFaq} disabled={createFAQ.isPending || updateFAQ.isPending}>
                  {(createFAQ.isPending || updateFAQ.isPending) ? 'Menyimpan...' : 'Simpan FAQ'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tips Penggunaan Aplikasi</h3>
            <Button onClick={handleAddTip}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tips Baru
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-4">
              {usageTips.map((tip) => (
                <div key={tip.id} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">{tip.title}</h4>
                      <p className="text-blue-700 text-sm mt-1">{tip.description}</p>
                      <Badge variant="secondary" className="mt-2">{tip.category}</Badge>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTip(tip)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteTip(tip.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Dialog open={isTipDialogOpen} onOpenChange={setIsTipDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTip ? 'Edit Tips' : 'Tambah Tips Baru'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Judul</label>
                  <Input 
                    placeholder="Masukkan judul..." 
                    value={tipForm.title}
                    onChange={(e) => setTipForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Textarea 
                    placeholder="Masukkan deskripsi..." 
                    rows={4} 
                    value={tipForm.description}
                    onChange={(e) => setTipForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <Select value={tipForm.category} onValueChange={(value) => setTipForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Login">Login</SelectItem>
                      <SelectItem value="Katalog">Katalog</SelectItem>
                      <SelectItem value="Pemesanan">Pemesanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSaveTip} disabled={createUsageTip.isPending || updateUsageTip.isPending}>
                  {(createUsageTip.isPending || updateUsageTip.isPending) ? 'Menyimpan...' : 'Simpan Tips'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <Input 
                  placeholder="Masukkan judul..." 
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pesan</label>
                <Textarea 
                  placeholder="Masukkan pesan broadcast..." 
                  rows={4} 
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Penerima</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleTargetAudienceChange('all-resellers', e.target.checked)}
                    />
                    <span>Semua Reseller</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleTargetAudienceChange('active-resellers', e.target.checked)}
                    />
                    <span>Reseller Aktif</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleTargetAudienceChange('customers', e.target.checked)}
                    />
                    <span>Customer</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Channel</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleChannelChange('whatsapp', e.target.checked)}
                    />
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleChannelChange('email', e.target.checked)}
                    />
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleChannelChange('push', e.target.checked)}
                    />
                    <Users className="h-4 w-4" />
                    <span>Push Notification</span>
                  </label>
                </div>
              </div>

              <Button onClick={handleSendBroadcast} disabled={createBroadcast.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {createBroadcast.isPending ? 'Mengirim...' : 'Kirim Broadcast'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactHelp;
