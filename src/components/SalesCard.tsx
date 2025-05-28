
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Phone, Mail, Building } from 'lucide-react';
import { Sales } from '@/types/sales';

interface SalesCardProps {
  sales: Sales;
  onEdit: (sales: Sales) => void;
  onDelete: (sales: Sales) => void;
}

const SalesCard: React.FC<SalesCardProps> = ({ sales, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {sales.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1">
              {sales.code}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(sales)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(sales)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sales.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {sales.phone}
          </div>
        )}
        {sales.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {sales.email}
          </div>
        )}
        {sales.branch_id && (
          <div className="flex items-center text-sm text-gray-600">
            <Building className="h-4 w-4 mr-2" />
            Cabang terdaftar
          </div>
        )}
        <div className="pt-2">
          <Badge variant={sales.is_active ? "default" : "secondary"}>
            {sales.is_active ? "Aktif" : "Tidak Aktif"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesCard;
