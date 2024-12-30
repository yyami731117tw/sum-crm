import { useCallback } from 'react';
import { User, Permission, ResourceType, PermissionLevel } from '../types/auth';

export const usePermissions = (currentUser: User) => {
  const checkPermission = useCallback(
    (resource: ResourceType, requiredLevel: PermissionLevel): boolean => {
      return currentUser.roles.some(role =>
        role.permissions.some(
          permission =>
            permission.resource === resource &&
            getPermissionWeight(permission.level) >= getPermissionWeight(requiredLevel)
        )
      );
    },
    [currentUser]
  );

  const getPermissionWeight = (level: PermissionLevel): number => {
    switch (level) {
      case 'admin':
        return 3;
      case 'write':
        return 2;
      case 'read':
        return 1;
      default:
        return 0;
    }
  };

  return {
    checkPermission,
  };
}; 