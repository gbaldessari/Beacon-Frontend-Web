import { PermissionType } from '../../services/auth/types/PermissionType.type';

export const ProtectedPaths = {
  HOME: '/home',
  HOME_PROFILE: '/home/profile',
} as const;

export type Path = typeof ProtectedPaths[keyof typeof ProtectedPaths];

export const HomeRouteConfig = {
  WELCOME: {
    routePath: '',
    navigatePath: ProtectedPaths.HOME,
    allowedPermissionTypes: [PermissionType.ADMIN, PermissionType.USER],
    fallbackPath: ProtectedPaths.HOME,
  },
  PROFILE: {
    routePath: 'profile',
    navigatePath: ProtectedPaths.HOME_PROFILE,
    allowedPermissionTypes: [PermissionType.ADMIN, PermissionType.USER],
    fallbackPath: ProtectedPaths.HOME,
  },
} as const;

export const hasRouteAccess = (
  permissionType: PermissionType | null,
  loading: boolean,
  allowedPermissionTypes: readonly PermissionType[],
) => !loading && !!permissionType && allowedPermissionTypes.includes(permissionType);
