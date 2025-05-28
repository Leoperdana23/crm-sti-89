
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { getPermissionTypeLabel } from '@/utils/permissionLabels';
import { RolePermission } from '@/types/user';

interface PermissionSwitchCellProps {
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  permissionId: string;
  rolePermissions: RolePermission[];
  onPermissionChange: (
    role: 'super_admin' | 'admin' | 'manager' | 'staff',
    permissionId: string,
    permissionType: 'can_view' | 'can_create' | 'can_edit' | 'can_delete',
    value: boolean
  ) => void;
}

const PermissionSwitchCell: React.FC<PermissionSwitchCellProps> = ({
  role,
  permissionId,
  rolePermissions,
  onPermissionChange
}) => {
  const permissionTypes = ['can_view', 'can_create', 'can_edit', 'can_delete'] as const;
  
  const getRolePermission = (role: string, permissionId: string) => {
    return rolePermissions.find(rp => rp.role === role && rp.permission_id === permissionId);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {permissionTypes.map(permType => {
        const rolePermission = getRolePermission(role, permissionId);
        const isChecked = rolePermission ? Boolean(rolePermission[permType]) : false;
        
        return (
          <div key={permType} className="flex items-center space-x-1">
            <Switch
              checked={isChecked}
              onCheckedChange={(value) => 
                onPermissionChange(role, permissionId, permType, value)
              }
              disabled={role === 'super_admin'} // Super admin always has all permissions
            />
            <span className="text-xs">{getPermissionTypeLabel(permType)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PermissionSwitchCell;
