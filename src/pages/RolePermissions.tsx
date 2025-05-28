
import React from 'react';
import PermissionsMatrix from '@/components/PermissionsMatrix';

const RolePermissions = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hak Akses Role</h1>
          <p className="text-gray-600 mt-1">Kelola hak akses untuk setiap role pengguna</p>
        </div>
      </div>

      <PermissionsMatrix />
    </div>
  );
};

export default RolePermissions;
