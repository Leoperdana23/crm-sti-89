
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
      console.log('Starting fetchPermissions...');
      const data = await permissionsService.fetchPermissions();
      console.log('Permissions fetched successfully:', data);
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Error fetching permissions: ' + (error as Error).message);
      setPermissions([]);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      console.log('Starting fetchRolePermissions...');
      const data = await permissionsService.fetchRolePermissions();
      console.log('Role permissions fetched successfully:', data);
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
      console.log('Updating role permission:', { role, permissionId, permissions });
      await permissionsService.updateRolePermission(role, permissionId, permissions);
      await fetchRolePermissions();
      console.log('Role permission updated successfully');
    } catch (error) {
      console.error('Error in updateRolePermission:', error);
      throw error;
    }
  };

  const refetch = async () => {
    console.log('Starting refetch...');
    setLoading(true);
    setError(null);
    try {
      await fetchPermissions();
      await fetchRolePermissions();
      console.log('Refetch completed successfully');
    } catch (error) {
      console.error('Error refetching data:', error);
      setError('Failed to refresh permissions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      console.log('Starting data initialization...');
      setLoading(true);
      setError(null);
      
      try {
        console.log('Step 1: Initialize permissions...');
        await initializePermissions();
        console.log('Step 2: Fetch permissions...');
        await fetchPermissions();
        console.log('Step 3: Fetch role permissions...');
        await fetchRolePermissions();
        console.log('Data initialization completed successfully');
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to initialize permissions data: ' + (error as Error).message);
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
