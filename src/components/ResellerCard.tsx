
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Building, Edit, Trash2 } from 'lucide-react';
import { Reseller } from '@/types/reseller';

interface ResellerCardProps {
  reseller: Reseller & { branches?: { name: string; code: string } };
  onEdit: (reseller: Reseller) => void;
  onDelete: (id: string) => void;
}

const ResellerCard = ({ reseller, onEdit, onDelete }: ResellerCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {reseller.name}
          </CardTitle>
          <Badge variant={reseller.is_active ? 'default' : 'secondary'}>
            {reseller.is_active ? 'Aktif' : 'Tidak Aktif'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{reseller.phone}</span>
          </div>
          
          {reseller.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{reseller.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-2">{reseller.address}</span>
          </div>
          
          {reseller.branches && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              <span>{reseller.branches.name} ({reseller.branches.code})</span>
            </div>
          )}
        </div>

        {/* Personal Info */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            {reseller.birth_date && (
              <div>
                <span className="font-medium">Tanggal Lahir:</span>
                <br />
                {formatDate(reseller.birth_date)}
              </div>
            )}
            {reseller.id_number && (
              <div>
                <span className="font-medium">No. KTP:</span>
                <br />
                {reseller.id_number}
              </div>
            )}
          </div>
          
          {reseller.total_points > 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Total Poin</div>
              <div className="text-lg font-bold text-blue-600">{reseller.total_points}</div>
            </div>
          )}
        </div>

        {reseller.notes && (
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Catatan:</span>
              <p className="mt-1">{reseller.notes}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(reseller)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(reseller.id)}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResellerCard;
