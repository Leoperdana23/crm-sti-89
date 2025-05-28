
import { permissionsService } from '@/services/permissionsService';

export const usePermissionsInit = () => {
  const initializePermissions = async () => {
    try {
      console.log('Initializing permissions...');
      
      // Check if permissions already exist
      const existingPermissions = await permissionsService.checkExistingPermissions();

      // If no permissions exist, create initial ones
      if (!existingPermissions || existingPermissions.length === 0) {
        const newPermissions = await permissionsService.createInitialPermissions();
        await permissionsService.createInitialRolePermissions(newPermissions);
      } else {
        console.log('Permissions already exist:', existingPermissions);
        // Check if role permissions exist
        const existingRolePerms = await permissionsService.checkExistingRolePermissions();

        if (!existingRolePerms || existingRolePerms.length === 0) {
          console.log('Creating role permissions for existing permissions...');
          await permissionsService.createInitialRolePermissions(existingPermissions);
        }
      }
    } catch (error) {
      console.error('Error in initializePermissions:', error);
      throw new Error('Initialization error: ' + (error as Error).message);
    }
  };

  return { initializePermissions };
};
