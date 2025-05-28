
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

const PermissionsMatrix: React.FC = () => {
  const { permissions, rolePermissions, loading, error, updateRolePermission, refetch } = usePermissions();
  const { toast } = useToast();

  const roles = ['super_admin', 'admin', 'manager', 'staff'] as const;
  const permissionTypes = ['can_view', 'can_create', 'can_edit', 'can_delete'] as const;

  const getRolePermission = (role: string, permissionId: string) => {
    return rolePermissions.find(rp => rp.role === role && rp.permission_id === permissionId);
  };

  const handlePermissionChange = async (
    role: 'super_admin' | 'admin' | 'manager' | 'staff',
    permissionId: string,
    permissionType: 'can_view' | 'can_create' | 'can_edit' | 'can_delete',
    value: boolean
  ) => {
    try {
      const currentPermission = getRolePermission(role, permissionId);
      
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'staff': return 'Staff';
      default: return role;
    }
  };

  const getPermissionTypeLabel = (type: string) => {
    switch (type) {
      case 'can_view': return 'Lihat';
      case 'can_create': return 'Buat';
      case 'can_edit': return 'Edit';
      case 'can_delete': return 'Hapus';
      default: return type;
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matrix Hak Akses Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Memuat data hak akses...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matrix Hak Akses Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <span>Terjadi kesalahan: {error}</span>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (permissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Matrix Hak Akses Role</CardTitle>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <p className="text-gray-600">Tidak ada data permissions. Sistem sedang menginisialisasi data...</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Muat Ulang Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
                      <div className="grid grid-cols-2 gap-2">
                        {permissionTypes.map(permType => {
                          const rolePermission = getRolePermission(role, permission.id);
                          const isChecked = rolePermission ? Boolean(rolePermission[permType]) : false;
                          
                          return (
                            <div key={permType} className="flex items-center space-x-1">
                              <Switch
                                checked={isChecked}
                                onCheckedChange={(value) => 
                                  handlePermissionChange(role, permission.id, permType, value)
                                }
                                disabled={role === 'super_admin'} // Super admin always has all permissions
                              />
                              <span className="text-xs">{getPermissionTypeLabel(permType)}</span>
                            </div>
                          );
                        })}
                      </div>
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
