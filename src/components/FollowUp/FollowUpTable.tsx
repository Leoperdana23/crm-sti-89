
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, CheckCircle, XCircle, ArrowRight, Edit2 } from 'lucide-react';
import { Customer } from '@/types/customer';
import { Branch } from '@/types/branch';

interface FollowUpTableProps {
  customers: Customer[];
  branches: Branch[];
  selectedCustomer: string | null;
  notes: string;
  followUpDate: string;
  onWhatsApp: (phone: string) => void;
  onStatusUpdate: (customerId: string, status: 'Cold' | 'Warm' | 'Hot' | 'Deal' | 'Tidak Jadi', dealDate?: string) => void;
  onMoveToStatus: (customerId: string, status: 'Follow-up' | 'Cold' | 'Warm' | 'Hot') => void;
  onSelectCustomer: (customerId: string | null) => void;
  onNotesChange: (notes: string) => void;
  onFollowUpDateChange: (date: string) => void;
  onAddNote: (customerId: string) => void;
  filterMessage: string;
}

const FollowUpTable: React.FC<FollowUpTableProps> = ({
  customers,
  branches,
  selectedCustomer,
  notes,
  followUpDate,
  onWhatsApp,
  onStatusUpdate,
  onMoveToStatus,
  onSelectCustomer,
  onNotesChange,
  onFollowUpDateChange,
  onAddNote,
  filterMessage
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Prospek':
        return 'bg-yellow-100 text-yellow-800';
      case 'Follow-up':
        return 'bg-blue-100 text-blue-800';
      case 'Cold':
        return 'bg-gray-100 text-gray-800';
      case 'Warm':
        return 'bg-orange-100 text-orange-800';
      case 'Hot':
        return 'bg-red-100 text-red-800';
      case 'Deal':
        return 'bg-green-100 text-green-800';
      case 'Tidak Jadi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : '-';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Follow-Up Pelanggan ({customers.length})</span>
          {filterMessage && (
            <span className="text-sm font-normal text-gray-600">
              Menampilkan data {filterMessage}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {filterMessage 
                ? `Tidak ada data pelanggan ${filterMessage}` 
                : "Tidak ada data pelanggan"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kebutuhan</TableHead>
                  <TableHead>Tanggal Input</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <React.Fragment key={customer.id}>
                    <TableRow>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{getBranchName(customer.branch_id || '')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {customer.needs || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onWhatsApp(customer.phone)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          
                          {customer.status === 'Follow-up' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatusUpdate(customer.id, 'Deal', new Date().toISOString().split('T')[0])}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatusUpdate(customer.id, 'Tidak Jadi')}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          
                          {customer.status === 'Prospek' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMoveToStatus(customer.id, 'Follow-up')}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {['Cold', 'Warm', 'Hot'].includes(customer.status) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatusUpdate(customer.id, 'Deal', new Date().toISOString().split('T')[0])}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatusUpdate(customer.id, 'Tidak Jadi')}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                        
                        <div className="flex space-x-1 mt-1">
                          {customer.status !== 'Cold' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onMoveToStatus(customer.id, 'Cold')}
                              className="text-xs px-2 py-1 h-6 text-gray-600 hover:bg-gray-50"
                            >
                              Cold
                            </Button>
                          )}
                          {customer.status !== 'Warm' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onMoveToStatus(customer.id, 'Warm')}
                              className="text-xs px-2 py-1 h-6 text-orange-600 hover:bg-orange-50"
                            >
                              Warm
                            </Button>
                          )}
                          {customer.status !== 'Hot' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onMoveToStatus(customer.id, 'Hot')}
                              className="text-xs px-2 py-1 h-6 text-red-600 hover:bg-red-50"
                            >
                              Hot
                            </Button>
                          )}
                          {customer.status !== 'Follow-up' && ['Cold', 'Warm', 'Hot'].includes(customer.status) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onMoveToStatus(customer.id, 'Follow-up')}
                              className="text-xs px-2 py-1 h-6 text-blue-600 hover:bg-blue-50"
                            >
                              F-up
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSelectCustomer(selectedCustomer === customer.id ? null : customer.id)}
                          className="text-blue-600"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          {selectedCustomer === customer.id ? 'Tutup' : 'Edit'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {selectedCustomer === customer.id && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <h4 className="font-medium text-gray-900">
                              Tambah Catatan Follow-up untuk {customer.name}
                            </h4>
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Catatan follow-up..."
                                value={notes}
                                onChange={(e) => onNotesChange(e.target.value)}
                                className="text-sm"
                              />
                              <div className="flex space-x-2">
                                <Input
                                  type="date"
                                  value={followUpDate}
                                  onChange={(e) => onFollowUpDateChange(e.target.value)}
                                  className="text-sm w-48"
                                  placeholder="Tanggal follow-up"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => onAddNote(customer.id)}
                                >
                                  Simpan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onSelectCustomer(null)}
                                >
                                  Batal
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowUpTable;
