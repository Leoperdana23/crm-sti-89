
import React, { useState } from 'react';
import { Plus, Search, Filter, BarChart, Users, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SurveyForm from '@/components/SurveyForm';
import { useCustomers } from '@/hooks/useCustomers';
import { useSurveys } from '@/hooks/useSurveys';
import { useBranches } from '@/hooks/useBranches';
import { Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

const Survey = () => {
  const { customers, loading: customersLoading } = useCustomers();
  const { surveys, loading: surveysLoading, addSurvey, createSurveyLink, getAverageRatings } = useSurveys();
  const { branches } = useBranches();
  const { toast } = useToast();
  const [isSurveyFormOpen, setIsSurveyFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'customers' | 'analytics'>('customers');

  // Filter customers who have Deal status AND completed work
  const readyForSurveyCustomers = customers.filter(customer => 
    customer.status === 'Deal' && customer.work_status === 'completed'
  );
  
  const filteredCustomers = readyForSurveyCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter === 'sudah_disurvei') {
      matchesStatus = customer.survey_status === 'sudah_disurvei';
    } else if (statusFilter === 'belum_disurvei') {
      matchesStatus = customer.survey_status === 'belum_disurvei' || !customer.survey_status;
    }

    let matchesBranch = true;
    if (branchFilter !== 'all') {
      matchesBranch = customer.branch_id === branchFilter;
    }
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleSurveySubmit = async (surveyData: any) => {
    try {
      await addSurvey(surveyData);
      toast({
        title: "Berhasil",
        description: "Survei berhasil disimpan",
      });
      setIsSurveyFormOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan survei.",
        variant: "destructive"
      });
    }
  };

  const handleCreateSurveyLink = async (customer: Customer) => {
    try {
      const survey = await createSurveyLink(customer.id);
      if (survey) {
        const surveyUrl = `${window.location.origin}/public-survey/${survey.survey_token}`;
        navigator.clipboard.writeText(surveyUrl);
        toast({
          title: "Link Survei Dibuat",
          description: "Link survei telah disalin ke clipboard dan siap dibagikan ke pelanggan",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat link survei.",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppSurvey = async (customer: Customer) => {
    try {
      const survey = await createSurveyLink(customer.id);
      if (survey) {
        const surveyUrl = `${window.location.origin}/public-survey/${survey.survey_token}`;
        const branch = branches.find(b => b.id === customer.branch_id);
        const branchName = branch?.name || 'Tim Kami';
        
        const message = `Assalamualaikum Bapak/Ibu ${customer.name} 
Saya dari Tim ${branchName} mengucapkan selamat karena Bapak/Ibu mendapatkan proteksi garansi barang ganti baru selama 1 tahun.
Mohon untuk lengkapi data diri untuk klaim garansi ganti baru jika ada kerusakan barang, dan mohon bantu kami untuk mengisi survei kepuasan layanan kami.
Jawaban Bapak/Ibu sangat berharga untuk meningkatkan kualitas pelayanan kami ke depannya.

Berikut link data diri dan survei ${surveyUrl}

Atas ketersediaan bapak/ibu mengisidata dan survei kami ucapkan terima kasih atas kerjasamanya.`;

        const cleanPhone = customer.phone.replace(/\D/g, '');
        const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
        const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        
        toast({
          title: "Link WhatsApp Dibuka",
          description: "Pesan WhatsApp dengan link survei telah disiapkan untuk dikirim ke pelanggan",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat link WhatsApp.",
        variant: "destructive"
      });
    }
  };

  const openSurveyForm = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsSurveyFormOpen(true);
  };

  const averageRatings = getAverageRatings();

  const getSurveyStatusBadge = (status?: string) => {
    if (status === 'sudah_disurvei') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Sudah Disurvei</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Belum Disurvei</Badge>;
  };

  if (customersLoading || surveysLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span>Memuat data survei...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survei Kepuasan Pelanggan</h1>
          <p className="text-gray-600 mt-1">Kelola survei kepuasan untuk pelanggan yang telah menyelesaikan pekerjaan</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-2 px-1 ${activeTab === 'customers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Daftar Pelanggan
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2 px-1 ${activeTab === 'analytics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          <BarChart className="h-4 w-4 inline mr-2" />
          Analitik Survei
        </button>
      </div>

      {activeTab === 'customers' && (
        <>
          {/* Filters */}
          <div className="flex space-x-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari nama atau nomor HP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="sudah_disurvei">Sudah Disurvei</SelectItem>
                  <SelectItem value="belum_disurvei">Belum Disurvei</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pelanggan Siap Survei ({filteredCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Tanggal Deal</TableHead>
                    <TableHead>Status Survei</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const branch = branches.find(b => b.id === customer.branch_id);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{branch?.name || '-'}</TableCell>
                        <TableCell>
                          {customer.deal_date ? new Date(customer.deal_date).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell>
                          {getSurveyStatusBadge(customer.survey_status)}
                        </TableCell>
                        <TableCell>
                          {customer.survey_status !== 'sudah_disurvei' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => openSurveyForm(customer)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Buat Survei
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCreateSurveyLink(customer)}
                                className="border-green-600 text-green-600 hover:bg-green-50"
                              >
                                Buat Link
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleWhatsAppSurvey(customer)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                WhatsApp
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pelanggan siap survei</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' || branchFilter !== 'all'
                      ? 'Tidak ada pelanggan yang sesuai dengan filter' 
                      : 'Belum ada pelanggan yang menyelesaikan pekerjaan dan siap untuk disurvei'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Survei</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{surveys.length}</div>
              <p className="text-gray-600">Survei terkumpul</p>
            </CardContent>
          </Card>

          {averageRatings && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pelayanan Teknisi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {averageRatings.serviceTechnician.toFixed(1)}/10
                  </div>
                  <p className="text-gray-600">Rata-rata penilaian</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pelayanan Sales/CS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {averageRatings.serviceSales.toFixed(1)}/10
                  </div>
                  <p className="text-gray-600">Rata-rata penilaian</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kualitas Produk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {averageRatings.productQuality.toFixed(1)}/10
                  </div>
                  <p className="text-gray-600">Rata-rata penilaian</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Kejelasan Penggunaan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {averageRatings.usageClarity.toFixed(1)}/10
                  </div>
                  <p className="text-gray-600">Rata-rata penilaian</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Persetujuan Harga</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {averageRatings.priceApprovalRate.toFixed(1)}%
                  </div>
                  <p className="text-gray-600">Menyetujui harga</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Survey Form Dialog */}
      <Dialog open={isSurveyFormOpen} onOpenChange={setIsSurveyFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Survei Kepuasan Pelanggan</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <SurveyForm
              customer={selectedCustomer}
              onSubmit={handleSurveySubmit}
              onCancel={() => {
                setIsSurveyFormOpen(false);
                setSelectedCustomer(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Survey;
