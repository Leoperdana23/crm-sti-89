
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Mail, Building } from 'lucide-react';
import { AppUser } from '@/types/user';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface UserCardProps {
  user: AppUser;
  onEdit: (user: AppUser) => void;
  onDelete: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const { hasPermission } = useUserPermissions();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'staff': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'staff': return 'Staff';
      default: return role;
    }
  };

  const canEdit = hasPermission('users', 'edit');
  const canDelete = hasPermission('users', 'delete');

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{user.full_name}</h3>
            <p className="text-sm text-gray-600">@{user.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRoleBadgeColor(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              <Badge variant={user.is_active ? "default" : "secondary"}>
                {user.is_active ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="text-blue-600 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(user.id)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          <span>{user.email}</span>
        </div>
        
        {user.branch_id && (
          <div className="flex items-center text-sm text-gray-600">
            <Building className="h-4 w-4 mr-2" />
            <span>Cabang: {user.branch_id}</span>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Dibuat: {new Date(user.created_at).toLocaleDateString('id-ID')}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
