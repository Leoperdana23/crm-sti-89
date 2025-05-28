
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Calendar, CheckCircle, XCircle, Cake } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';

const FollowUp = () => {
  const { customers, updateCustomer, getCustomersByStatus } = useCustomers();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const prospekCustomers = getCustomersByStatus('Prospek');
  const followUpCustomers = getCustomersByStatus('Follow-up');

  // Get customers having birthday today
  const getTodayBirthdayCustomers = () => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const todayDay = today.getDate();

    return customers.filter(customer => {
      const birthDate = new Date(customer.birthDate);
      const birthMonth = birthDate.getMonth() + 1;
      const birthDay = birthDate.getDate();
      
      return birthMonth === todayMonth && birthDay === todayDay;
    });
  };

  const birthdayCustomers = getTodayBirthdayCustomers();

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${whatsappPhone}`, '_blank');
  };

  const handleBirthdayWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const birthdayMessage = `Selamat ulang tahun ${name}! 🎉🎂 Semoga panjang umur, sehat selalu, dan bahagia. Terima kasih sudah menjadi pelanggan setia kami.`;
    const encodedMessage = encodeURIComponent(birthdayMessage);
    window.open(`https://wa.me/${whatsappPhone}?text=${encodedMessage}`, '_blank');
  };

  const handleStatusUpdate = (customerId: string, newStatus: 'Deal' | 'Tidak Jadi', dealDate?: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'Deal' && dealDate) {
      updates.dealDate = dealDate;
    }
    
    updateCustomer(customerId, updates);
    toast({
      title: "Berhasil",
      description: `Status pelanggan berhasil diubah menjadi ${newStatus}`,
    });
  };

  const addFollowUpNote = (customerId: string) => {
    if (!notes.trim()) {
      toast({
        title: "Error",
        description: "Catatan follow-up tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would add to interactions array
    toast({
      title: "Berhasil",
      description: "Catatan follow-up berhasil ditambahkan",
    });
    setNotes('');
    setFollowUpDate('');
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Follow-Up Pelanggan</h1>
        <p className="text-gray-600 mt-1">Kelola prospek dan jadwal follow-up</p>
      </div>

      {/* Birthday Customers Section */}
      {birthdayCustomers.length > 0 && (
        <Card className="border-pink-200 bg-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cake className="h-5 w-5 mr-2 text-pink-600" />
              Ulang Tahun Hari Ini ({birthdayCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {birthdayCustomers.map((customer) => (
              <div key={customer.id} className="p-4 border border-pink-300 bg-white rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {customer.name}
                      <Cake className="h-4 w-4 ml-2 text-pink-500" />
                    </h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-600">{customer.address}</p>
                  </div>
                  <Badge className="bg-pink-100 text-pink-800">
                    {customer.status}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleBirthdayWhatsApp(customer.phone, customer.name)}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Ucapkan Selamat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWhatsApp(customer.phone)}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    WhatsApp Biasa
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospek Baru */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />
              Prospek Baru ({prospekCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prospekCustomers.map((customer) => (
              <div key={customer.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-600">{customer.needs}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {customer.status}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWhatsApp(customer.phone)}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCustomer(customer.id, { status: 'Follow-up' })}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Follow-up
                  </Button>
                </div>
              </div>
            ))}
            
            {prospekCustomers.length === 0 && (
              <p className="text-gray-500 text-center py-8">Tidak ada prospek baru</p>
            )}
          </CardContent>
        </Card>

        {/* Follow-up Aktif */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Follow-up Aktif ({followUpCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {followUpCustomers.map((customer) => (
              <div key={customer.id} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-600">{customer.needs}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {customer.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWhatsApp(customer.phone)}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WA
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(customer.id, 'Deal', new Date().toISOString().split('T')[0])}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Deal
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(customer.id, 'Tidak Jadi')}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Tidak Jadi
                    </Button>
                  </div>
                  
                  {selectedCustomer === customer.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Catatan follow-up..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex space-x-2">
                        <Input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => addFollowUpNote(customer.id)}
                        >
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCustomer(null)}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCustomer(customer.id)}
                      className="text-blue-600"
                    >
                      + Tambah Catatan
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {followUpCustomers.length === 0 && (
              <p className="text-gray-500 text-center py-8">Tidak ada follow-up aktif</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FollowUp;
