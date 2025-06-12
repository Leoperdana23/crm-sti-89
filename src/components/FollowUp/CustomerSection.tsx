
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Customer } from '@/types/customer';
import ProspectCard from './ProspectCard';
import FollowUpCard from './FollowUpCard';

interface CustomerSectionProps {
  title: string;
  icon: React.ReactNode;
  customers: Customer[];
  type: 'prospect' | 'followup';
  emptyMessage: string;
  selectedCustomer?: string | null;
  notes?: string;
  followUpDate?: string;
  onWhatsApp: (phone: string) => void;
  onMoveToFollowUp?: (customerId: string) => void;
  onStatusUpdate?: (customerId: string, status: 'Deal' | 'Tidak Jadi', dealDate?: string) => void;
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
        {customers.map((customer) => (
          type === 'prospect' ? (
            <ProspectCard
              key={customer.id}
              customer={customer}
              onWhatsApp={onWhatsApp}
              onMoveToFollowUp={onMoveToFollowUp!}
            />
          ) : (
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
            />
          )
        ))}
        
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
