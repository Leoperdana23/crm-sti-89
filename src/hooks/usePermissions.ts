
import { useState, useEffect } from 'react';
import { Permission, RolePermission } from '@/types/user';
import { permissionsService } from '@/services/permissionsService';
import { usePermissionsInit } from '@/hooks/usePermissionsInit';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { initializePermissions } = usePermissionsInit();

  const fetchPermissions = async () => {
    try {
      const data = await permissionsService.fetchPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Error fetching permissions: ' + (error as Error).message);
      setPermissions([]);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const data = await permissionsService.fetchRolePermissions();
      setRolePermissions(data);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setError('Error fetching role permissions: ' + (error as Error).message);
      setRolePermissions([]);
    }
  };

  const updateRolePermission = async (
    role: 'super_admin' | 'admin' | 'manager' | 'staff', 
    permissionId: string, 
    permissions: {
      can_view: boolean;
      can_create: boolean;
      can_edit: boolean;
      can_delete: boolean;
    }
  ) => {
    try {
      await permissionsService.updateRolePermission(role, permissionId, permissions);
      await fetchRolePermissions();
    } catch (error) {
      console.error('Error in updateRolePermission:', error);
      throw error;
    }
  };

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchPermissions();
      await fetchRolePermissions();
    } catch (error) {
      console.error('Error refetching data:', error);
      setError('Failed to refresh permissions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await initializePermissions();
        await fetchPermissions();
        await fetchRolePermissions();
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to initialize permissions data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    permissions,
    rolePermissions,
    loading,
    error,
    updateRolePermission,
    refetch
  };
};
