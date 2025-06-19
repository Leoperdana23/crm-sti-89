
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Customer } from '@/types/customer';
import ProspectCard from './ProspectCard';
import FollowUpCard from './FollowUpCard';
import StatusCard from './StatusCard';

interface CustomerSectionProps {
  title: string;
  icon: React.ReactNode;
  customers: Customer[];
  type: 'prospect' | 'followup' | 'status';
  emptyMessage: string;
  selectedCustomer?: string | null;
  notes?: string;
  followUpDate?: string;
  onWhatsApp: (phone: string) => void;
  onMoveToFollowUp?: (customerId: string) => void;
  onMoveToStatus?: (customerId: string, status: 'Follow-up' | 'Cold' | 'Warm' | 'Hot') => void;
  onStatusUpdate?: (customerId: string, status: 'Cold' | 'Warm' | 'Hot' | 'Deal' | 'Tidak Jadi', dealDate?: string) => void;
  onSelectCustomer?: (customerId: string | null) => void;
  onNotesChange?: (notes: string) => void;
  onFollowUpDateChange?: (date: string) => void;
  onAddNote?: (customerId: string) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({
  title,
  icon,
  customers,
  type,
  emptyMessage,
  selectedCustomer,
  notes = '',
  followUpDate = '',
  onWhatsApp,
  onMoveToFollowUp,
  onMoveToStatus,
  onStatusUpdate,
  onSelectCustomer,
  onNotesChange,
  onFollowUpDateChange,
  onAddNote
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          {title} ({customers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customers.map((customer) => {
          if (type === 'prospect') {
            return (
              <ProspectCard
                key={customer.id}
                customer={customer}
                onWhatsApp={onWhatsApp}
                onMoveToFollowUp={onMoveToFollowUp!}
                onMoveToStatus={onMoveToStatus!}
              />
            );
          } else if (type === 'followup') {
            return (
              <FollowUpCard
                key={customer.id}
                customer={customer}
                selectedCustomer={selectedCustomer!}
                notes={notes}
                followUpDate={followUpDate}
                onWhatsApp={onWhatsApp}
                onStatusUpdate={onStatusUpdate!}
                onSelectCustomer={onSelectCustomer!}
                onNotesChange={onNotesChange!}
                onFollowUpDateChange={onFollowUpDateChange!}
                onAddNote={onAddNote!}
                onMoveToStatus={onMoveToStatus!}
              />
            );
          } else {
            return (
              <StatusCard
                key={customer.id}
                customer={customer}
                selectedCustomer={selectedCustomer!}
                notes={notes}
                followUpDate={followUpDate}
                onWhatsApp={onWhatsApp}
                onStatusUpdate={onStatusUpdate!}
                onSelectCustomer={onSelectCustomer!}
                onNotesChange={onNotesChange!}
                onFollowUpDateChange={onFollowUpDateChange!}
                onAddNote={onAddNote!}
                onMoveToStatus={onMoveToStatus!}
              />
            );
          }
        })}
        
        {customers.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            {emptyMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerSection;
