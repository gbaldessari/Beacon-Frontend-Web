/**
 * Perfil del usuario autenticado obtenido desde el servidor.
 */
export type GetProfileResponse = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleName: string;
  permissionType: string;
};
