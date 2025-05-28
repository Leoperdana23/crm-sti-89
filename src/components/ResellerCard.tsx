
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';
import { Reseller } from '@/types/reseller';
import { format } from 'date-fns';

interface ResellerCardProps {
  reseller: Reseller;
  onEdit: (reseller: Reseller) => void;
  onDelete: (id: string) => void;
}

const ResellerCard: React.FC<ResellerCardProps> = ({ reseller, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {reseller.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={reseller.is_active ? "default" : "secondary"}>
                {reseller.is_active ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(reseller)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(reseller.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{reseller.phone}</span>
        </div>
        
        {reseller.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{reseller.email}</span>
          </div>
        )}
        
        <div className="flex items-start text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
          <span>{reseller.address}</span>
        </div>
        
        {reseller.birth_date && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{format(new Date(reseller.birth_date), 'dd/MM/yyyy')}</span>
          </div>
        )}
        
        {reseller.id_number && (
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{reseller.id_number}</span>
          </div>
        )}
        
        {reseller.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
            <strong>Catatan:</strong> {reseller.notes}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          Dibuat: {format(new Date(reseller.created_at), 'dd/MM/yyyy HH:mm')}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResellerCard;
