
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Customer } from '@/types/customer';

interface StatusCardProps {
  customer: Customer;
  selectedCustomer: string | null;
  notes: string;
  followUpDate: string;
  onWhatsApp: (phone: string) => void;
  onStatusUpdate: (customerId: string, status: 'Cold' | 'Warm' | 'Hot' | 'Deal' | 'Tidak Jadi', dealDate?: string) => void;
  onSelectCustomer: (customerId: string | null) => void;
  onNotesChange: (notes: string) => void;
  onFollowUpDateChange: (date: string) => void;
  onAddNote: (customerId: string) => void;
  onMoveToStatus: (customerId: string, status: 'Follow-up' | 'Cold' | 'Warm' | 'Hot') => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  customer,
  selectedCustomer,
  notes,
  followUpDate,
  onWhatsApp,
  onStatusUpdate,
  onSelectCustomer,
  onNotesChange,
  onFollowUpDateChange,
  onAddNote,
  onMoveToStatus
}) => {
  const isSelected = selectedCustomer === customer.id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Cold':
        return 'bg-gray-100 text-gray-800';
      case 'Warm':
        return 'bg-orange-100 text-orange-800';
      case 'Hot':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${
      customer.status === 'Cold' ? 'border-gray-200 bg-gray-50' :
      customer.status === 'Warm' ? 'border-orange-200 bg-orange-50' :
      'border-red-200 bg-red-50'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
          <p className="text-sm text-gray-600">{customer.phone}</p>
          <p className="text-sm text-gray-600">{customer.needs}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(customer.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
        <Badge className={getStatusColor(customer.status)}>
          {customer.status}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onWhatsApp(customer.phone)}
            className="text-green-600 hover:bg-green-50"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            WA
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusUpdate(customer.id, 'Deal', new Date().toISOString().split('T')[0])}
            className="text-green-600 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Deal
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusUpdate(customer.id, 'Tidak Jadi')}
            className="text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Tidak Jadi
          </Button>
        </div>

        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMoveToStatus(customer.id, 'Follow-up')}
            className="text-blue-600 hover:bg-blue-50 text-xs"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Follow-up
          </Button>
          {customer.status !== 'Cold' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveToStatus(customer.id, 'Cold')}
              className="text-gray-600 hover:bg-gray-50 text-xs"
            >
              Cold
            </Button>
          )}
          {customer.status !== 'Warm' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveToStatus(customer.id, 'Warm')}
              className="text-orange-600 hover:bg-orange-50 text-xs"
            >
              Warm
            </Button>
          )}
          {customer.status !== 'Hot' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveToStatus(customer.id, 'Hot')}
              className="text-red-600 hover:bg-red-50 text-xs"
            >
              Hot
            </Button>
          )}
        </div>
        
        {isSelected ? (
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
                className="text-sm"
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
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelectCustomer(customer.id)}
            className="text-blue-600"
          >
            + Tambah Catatan
          </Button>
        )}
      </div>
    </div>
  );
};

export default StatusCard;
