
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { getRoleLabel } from '@/utils/permissionLabels';
import PermissionSwitchCell from './PermissionsMatrix/PermissionSwitchCell';
import PermissionsLoadingState from './PermissionsMatrix/PermissionsLoadingState';
import PermissionsErrorState from './PermissionsMatrix/PermissionsErrorState';
import PermissionsEmptyState from './PermissionsMatrix/PermissionsEmptyState';

const PermissionsMatrix: React.FC = () => {
  const { permissions, rolePermissions, loading, error, updateRolePermission, refetch } = usePermissions();
  const { toast } = useToast();

  const roles = ['super_admin', 'admin', 'manager', 'staff'] as const;

  const handlePermissionChange = async (
    role: 'super_admin' | 'admin' | 'manager' | 'staff',
    permissionId: string,
    permissionType: 'can_view' | 'can_create' | 'can_edit' | 'can_delete',
    value: boolean
  ) => {
    try {
      const currentPermission = rolePermissions.find(rp => rp.role === role && rp.permission_id === permissionId);
      
      // If no permission exists, create a default one
      let updatedPermissions;
      if (!currentPermission) {
        console.log('Creating new permission for', role, permissionId);
        updatedPermissions = {
          can_view: permissionType === 'can_view' ? value : false,
          can_create: permissionType === 'can_create' ? value : false,
          can_edit: permissionType === 'can_edit' ? value : false,
          can_delete: permissionType === 'can_delete' ? value : false
        };
      } else {
        updatedPermissions = {
          can_view: currentPermission.can_view,
          can_create: currentPermission.can_create,
          can_edit: currentPermission.can_edit,
          can_delete: currentPermission.can_delete,
          [permissionType]: value
        };
      }

      await updateRolePermission(role, permissionId, updatedPermissions);
      
      toast({
        title: "Berhasil",
        description: "Hak akses berhasil diperbarui",
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui hak akses",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Berhasil",
        description: "Data hak akses berhasil dimuat ulang",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat ulang data hak akses",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <PermissionsLoadingState />;
  }

  if (error) {
    return <PermissionsErrorState error={error} onRefresh={handleRefresh} />;
  }

  if (permissions.length === 0) {
    return <PermissionsEmptyState onRefresh={handleRefresh} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Matrix Hak Akses Role</CardTitle>
            <p className="text-sm text-gray-600">Atur hak akses untuk setiap role dan menu</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-left">Menu / Fitur</th>
                {roles.map(role => (
                  <th key={role} className="border border-gray-300 p-3 text-center">
                    <Badge variant="outline">{getRoleLabel(role)}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map(permission => (
                <tr key={permission.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">
                    <div>
                      <div className="font-medium">{permission.description}</div>
                      <div className="text-sm text-gray-500">{permission.menu_path}</div>
                    </div>
                  </td>
                  {roles.map(role => (
                    <td key={`${role}-${permission.id}`} className="border border-gray-300 p-3">
                      <PermissionSwitchCell
                        role={role}
                        permissionId={permission.id}
                        rolePermissions={rolePermissions}
                        onPermissionChange={handlePermissionChange}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsMatrix;
