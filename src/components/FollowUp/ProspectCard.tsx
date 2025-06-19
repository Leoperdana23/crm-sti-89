
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Customer } from '@/types/customer';

interface ProspectCardProps {
  customer: Customer;
  onWhatsApp: (phone: string) => void;
  onMoveToFollowUp: (customerId: string) => void;
  onMoveToStatus: (customerId: string, status: 'Follow-up' | 'Cold' | 'Warm' | 'Hot') => void;
}

const ProspectCard: React.FC<ProspectCardProps> = ({
  customer,
  onWhatsApp,
  onMoveToFollowUp,
  onMoveToStatus
}) => {
  return (
    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
          <p className="text-sm text-gray-600">{customer.phone}</p>
          <p className="text-sm text-gray-600">{customer.needs}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(customer.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>
        <Badge className="bg-yellow-100 text-yellow-800">
          {customer.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onWhatsApp(customer.phone)}
            className="text-green-600 hover:bg-green-50"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMoveToFollowUp(customer.id)}
            className="text-blue-600 hover:bg-blue-50"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Follow-up
          </Button>
        </div>
        
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMoveToStatus(customer.id, 'Cold')}
            className="text-gray-600 hover:bg-gray-50 text-xs"
          >
            Cold
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMoveToStatus(customer.id, 'Warm')}
            className="text-orange-600 hover:bg-orange-50 text-xs"
          >
            Warm
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMoveToStatus(customer.id, 'Hot')}
            className="text-red-600 hover:bg-red-50 text-xs"
          >
            Hot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProspectCard;
