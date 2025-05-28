
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

const PermissionsMatrix: React.FC = () => {
  const { permissions, rolePermissions, updateRolePermission } = usePermissions();
  const { toast } = useToast();

  const roles = ['super_admin', 'admin', 'manager', 'staff'];
  const permissionTypes = ['can_view', 'can_create', 'can_edit', 'can_delete'];

  const getRolePermission = (role: string, permissionId: string) => {
    return rolePermissions.find(rp => rp.role === role && rp.permission_id === permissionId);
  };

  const handlePermissionChange = async (
    role: string,
    permissionId: string,
    permissionType: string,
    value: boolean
  ) => {
    try {
      const currentPermission = getRolePermission(role, permissionId);
      if (!currentPermission) return;

      const updatedPermissions = {
        can_view: currentPermission.can_view,
        can_create: currentPermission.can_create,
        can_edit: currentPermission.can_edit,
        can_delete: currentPermission.can_delete,
        [permissionType]: value
      };

      await updateRolePermission(role, permissionId, updatedPermissions);
      
      toast({
        title: "Berhasil",
        description: "Hak akses berhasil diperbarui",
      });
    } catch (error) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matrix Hak Akses Role</CardTitle>
        <p className="text-sm text-gray-600">Atur hak akses untuk setiap role dan menu</p>
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
                          return (
                            <div key={permType} className="flex items-center space-x-1">
                              <Switch
                                checked={rolePermission?.[permType as keyof typeof rolePermission] || false}
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
