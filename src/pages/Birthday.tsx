
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Cake, Users, Filter } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useResellers } from '@/hooks/useResellers';

const Birthday = () => {
  const { customers } = useCustomers();
  const { data: resellers = [] } = useResellers();
  const [selectedMonth, setSelectedMonth] = useState<string>('current');

  const months = [
    { value: 'current', label: 'Bulan Ini' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  // Get customers having birthday in selected month
  const getFilteredBirthdayCustomers = () => {
    const today = new Date();
    const targetMonth = selectedMonth === 'current' ? today.getMonth() + 1 : parseInt(selectedMonth);

    return customers.filter(customer => {
      const birthDate = new Date(customer.birth_date);
      const birthMonth = birthDate.getMonth() + 1;
      
      return birthMonth === targetMonth;
    });
  };

  // Get resellers having birthday in selected month
  const getFilteredBirthdayResellers = () => {
    const today = new Date();
    const targetMonth = selectedMonth === 'current' ? today.getMonth() + 1 : parseInt(selectedMonth);

    return resellers.filter(reseller => {
      if (!reseller.birth_date) return false;
      const birthDate = new Date(reseller.birth_date);
      const birthMonth = birthDate.getMonth() + 1;
      
      return birthMonth === targetMonth && reseller.is_active;
    });
  };

  const birthdayCustomers = getFilteredBirthdayCustomers();
  const birthdayResellers = getFilteredBirthdayResellers();

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${whatsappPhone}`, '_blank');
  };

  const handleBirthdayWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const birthdayMessage = `Selamat ulang tahun ${name}! 🎉🎂 Semoga panjang umur, sehat selalu, dan bahagia. Terima kasih sudah menjadi mitra setia kami.`;
    const encodedMessage = encodeURIComponent(birthdayMessage);
    window.open(`https://wa.me/${whatsappPhone}?text=${encodedMessage}`, '_blank');
  };

  const formatBirthDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const getDisplayMonthName = () => {
    if (selectedMonth === 'current') {
      const today = new Date();
      return today.toLocaleDateString('id-ID', { month: 'long' });
    }
    
    const monthIndex = parseInt(selectedMonth) - 1;
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return monthNames[monthIndex];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ulang Tahun</h1>
        <p className="text-gray-600 mt-1">Kelola ucapan ulang tahun untuk pelanggan dan reseller</p>
      </div>

      {/* Month Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            Filter Berdasarkan Bulan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Pilih Bulan:</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Birthday Section - Combined for Customers and Resellers */}
      {(birthdayCustomers.length > 0 || birthdayResellers.length > 0) ? (
        <Card className="border-pink-200 bg-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cake className="h-5 w-5 mr-2 text-pink-600" />
              Ulang Tahun Bulan {getDisplayMonthName()} ({birthdayCustomers.length + birthdayResellers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Birthday Customers */}
            {birthdayCustomers.map((customer) => (
              <div key={`customer-${customer.id}`} className="p-4 border border-pink-300 bg-white rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {customer.name}
                      <Cake className="h-4 w-4 ml-2 text-pink-500" />
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                        <Users className="h-3 w-3 mr-1" />
                        Pelanggan
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-600">{customer.address}</p>
                    <p className="text-sm text-pink-600 font-medium">Ulang tahun: {formatBirthDate(customer.birth_date)}</p>
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

            {/* Birthday Resellers */}
            {birthdayResellers.map((reseller) => (
              <div key={`reseller-${reseller.id}`} className="p-4 border border-pink-300 bg-white rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {reseller.name}
                      <Cake className="h-4 w-4 ml-2 text-pink-500" />
                      <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700">
                        <Users className="h-3 w-3 mr-1" />
                        Reseller
                      </Badge>
                    </h3>
                    <p className="text-sm text-gray-600">{reseller.phone}</p>
                    {reseller.email && (
                      <p className="text-sm text-gray-600">{reseller.email}</p>
                    )}
                    <p className="text-sm text-gray-600">{reseller.address}</p>
                    <p className="text-sm text-pink-600 font-medium">Ulang tahun: {formatBirthDate(reseller.birth_date!)}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {reseller.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleBirthdayWhatsApp(reseller.phone, reseller.name)}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Ucapkan Selamat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWhatsApp(reseller.phone)}
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
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Cake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Ulang Tahun</h3>
            <p className="text-gray-600">Tidak ada pelanggan atau reseller yang berulang tahun di bulan {getDisplayMonthName()}.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Birthday;
