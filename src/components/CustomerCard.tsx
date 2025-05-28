
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, MapPin, Calendar, Edit, Trash2, RotateCcw, User } from 'lucide-react';
import { Customer } from '@/types/customer';
import { useSales } from '@/hooks/useSales';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onWhatsApp: (phone: string) => void;
  onStatusUpdate?: (customerId: string, status: Customer['status']) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ 
  customer, 
  onEdit, 
  onDelete, 
  onWhatsApp, 
  onStatusUpdate 
}) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const { sales } = useSales();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Prospek': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Follow-up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Deal': return 'bg-green-100 text-green-800 border-green-200';
      case 'Tidak Jadi': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID');
    } catch (error) {
      return dateString;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(customer.id, newStatus as Customer['status']);
    }
    setIsEditingStatus(false);
  };

  const getSalesName = () => {
    if (!customer.sales_id) return null;
    const salesPerson = sales.find(s => s.id === customer.sales_id);
    return salesPerson?.name;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{customer.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {!isEditingStatus ? (
                <>
                  <Badge className={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                  {(customer.status === 'Deal' || customer.status === 'Tidak Jadi') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingStatus(true)}
                      className="h-6 px-2 text-gray-500 hover:text-gray-700"
                      title="Edit Status"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Select onValueChange={handleStatusChange} defaultValue={customer.status}>
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prospek">Prospek</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Deal">Deal</SelectItem>
                      <SelectItem value="Tidak Jadi">Tidak Jadi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingStatus(false)}
                    className="h-6 px-2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(customer)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(customer.id)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2" />
          <span>{customer.phone}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWhatsApp(customer.phone)}
            className="ml-2 text-green-600 hover:bg-green-50"
          >
            WA
          </Button>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">{customer.address}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{formatDate(customer.birth_date)}</span>
        </div>

        {getSalesName() && (
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span><strong>Sales:</strong> {getSalesName()}</span>
          </div>
        )}
        
        {customer.needs && (
          <div className="text-sm text-gray-600">
            <strong>Kebutuhan:</strong> {customer.needs}
          </div>
        )}
        
        {customer.notes && (
          <div className="text-sm text-gray-600">
            <strong>Catatan:</strong> {customer.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
