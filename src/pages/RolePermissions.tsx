
import React from 'react';
import { Shield } from 'lucide-react';
import PermissionsMatrix from '@/components/PermissionsMatrix';

const RolePermissions = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Setting Hak Akses Role
          </h1>
          <p className="text-gray-600 mt-1">Kelola hak akses untuk setiap role pengguna sistem</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Informasi Hak Akses</h3>
            <p className="text-sm text-blue-700 mt-1">
              Atur hak akses untuk setiap role (Super Admin, Admin, Manager, Staff) pada setiap menu/fitur aplikasi. 
              Super Admin memiliki akses penuh dan tidak dapat diubah.
            </p>
          </div>
        </div>
      </div>

      <PermissionsMatrix />
    </div>
  );
};

export default RolePermissions;
