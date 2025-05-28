
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Play, CheckCircle, Clock, MapPin, Phone, User, Calendar } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import { useSales } from '@/hooks/useSales';

const WorkProcess = () => {
  const { customers, updateCustomer, getCustomersByStatus } = useCustomers();
  const { sales } = useSales();
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [workNotes, setWorkNotes] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');

  const dealCustomers = getCustomersByStatus('Deal').filter(customer => 
    !customer.workStatus || customer.workStatus === 'not_started'
  );
  
  const ongoingWork = customers.filter(customer => 
    customer.status === 'Deal' && customer.workStatus === 'in_progress'
  );

  const completedWork = customers.filter(customer => 
    customer.status === 'Deal' && customer.workStatus === 'completed'
  );

  const getSalesName = (salesId?: string) => {
    if (!salesId) return 'Tidak ada sales';
    const salesPerson = sales.find(s => s.id === salesId);
    return salesPerson?.name || 'Sales tidak ditemukan';
  };

  const handleStartWork = (customerId: string) => {
    if (!workNotes.trim()) {
      toast({
        title: "Error",
        description: "Catatan pekerjaan harus diisi",
        variant: "destructive",
      });
      return;
    }

    updateCustomer(customerId, {
      workStatus: 'in_progress',
      workStartDate: new Date().toISOString(),
      workNotes: workNotes,
      estimatedDays: estimatedDays ? parseInt(estimatedDays) : undefined
    });

    toast({
      title: "Berhasil",
      description: "Pekerjaan berhasil dimulai",
    });

    setSelectedCustomer(null);
    setWorkNotes('');
    setEstimatedDays('');
  };

  const handleCompleteWork = (customerId: string) => {
    updateCustomer(customerId, {
      workStatus: 'completed',
      workCompletedDate: new Date().toISOString()
    });

    toast({
      title: "Berhasil",
      description: "Pekerjaan berhasil diselesaikan",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const calculateWorkDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffInDays > 0) {
      return `${diffInDays} hari ${diffInHours} jam`;
    } else {
      return `${diffInHours} jam`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proses Pekerjaan</h1>
        <p className="text-gray-600 mt-1">Kelola pekerjaan untuk pelanggan yang sudah deal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Siap Mulai Pekerjaan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2 text-blue-600" />
              Siap Mulai ({dealCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dealCustomers.map((customer) => (
              <div key={customer.id} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {customer.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {getSalesName(customer.salesId)}
                    </div>
                    {customer.dealDate && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <strong>Deal:</strong> {formatDate(customer.dealDate)}
                      </div>
                    )}
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    Deal
                  </Badge>
                </div>

                {selectedCustomer === customer.id ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Catatan pekerjaan yang akan dilakukan..."
                      value={workNotes}
                      onChange={(e) => setWorkNotes(e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="Estimasi hari pengerjaan"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleStartWork(customer.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Mulai Pekerjaan
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
                    onClick={() => setSelectedCustomer(customer.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Mulai Pekerjaan
                  </Button>
                )}
              </div>
            ))}

            {dealCustomers.length === 0 && (
              <p className="text-gray-500 text-center py-8">Tidak ada pekerjaan siap mulai</p>
            )}
          </CardContent>
        </Card>

        {/* Sedang Dikerjakan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              Sedang Dikerjakan ({ongoingWork.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ongoingWork.map((customer) => (
              <div key={customer.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {getSalesName(customer.salesId)}
                    </div>
                    {customer.workStartDate && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <strong>Mulai:</strong> {formatDateTime(customer.workStartDate)}
                      </div>
                    )}
                    {customer.estimatedDays && (
                      <p className="text-sm text-gray-600">
                        <strong>Estimasi:</strong> {customer.estimatedDays} hari
                      </p>
                    )}
                    {customer.workStartDate && (
                      <p className="text-sm text-blue-600 font-medium">
                        <strong>Durasi:</strong> {calculateWorkDuration(customer.workStartDate)}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    Dikerjakan
                  </Badge>
                </div>

                {customer.workNotes && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Catatan:</strong> {customer.workNotes}
                    </p>
                  </div>
                )}

                <Button
                  size="sm"
                  onClick={() => handleCompleteWork(customer.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Selesai
                </Button>
              </div>
            ))}

            {ongoingWork.length === 0 && (
              <p className="text-gray-500 text-center py-8">Tidak ada pekerjaan yang sedang dikerjakan</p>
            )}
          </CardContent>
        </Card>

        {/* Pekerjaan Selesai */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Selesai ({completedWork.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedWork.map((customer) => (
              <div key={customer.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {customer.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <User className="h-4 w-4 mr-1" />
                      {getSalesName(customer.salesId)}
                    </div>
                    {customer.workStartDate && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <strong>Mulai:</strong> {formatDateTime(customer.workStartDate)}
                      </div>
                    )}
                    {customer.workCompletedDate && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <strong>Selesai:</strong> {formatDateTime(customer.workCompletedDate)}
                      </div>
                    )}
                    {customer.workStartDate && customer.workCompletedDate && (
                      <p className="text-sm text-green-600 font-medium">
                        <strong>Total Durasi:</strong> {calculateWorkDuration(customer.workStartDate, customer.workCompletedDate)}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Selesai
                  </Badge>
                </div>

                {customer.workNotes && (
                  <div className="text-sm text-gray-600">
                    <strong>Catatan:</strong> {customer.workNotes}
                  </div>
                )}
              </div>
            ))}

            {completedWork.length === 0 && (
              <p className="text-gray-500 text-center py-8">Belum ada pekerjaan yang selesai</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkProcess;
