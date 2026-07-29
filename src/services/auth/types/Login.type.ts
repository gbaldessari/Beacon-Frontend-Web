import type { PermissionType } from "./PermissionType.type";

/**
 * Define el tipo de datos para la carga útil de inicio de sesión.
 * Este tipo se utiliza para enviar la información necesaria al servidor al iniciar sesión.
 * 
 * @property string email - Correo electrónico del usuario.
 * @property string password - Contraseña del usuario.
 */
export type LoginPayload = {
  email: string;
  password: string;
};

/**
 * Define el tipo de datos para la respuesta de inicio de sesión.
 * Este tipo se utiliza para recibir la información de inicio de sesión desde el servidor.
 * 
 * @property string accessToken - Token de acceso del usuario.
 * @property string firstName - Primer nombre del usuario.
 * @property string lastName - Apellido del usuario.
 * @property string role - Código del rol asignado al usuario autenticado.
 */
export type LoginResponse = {
  accessToken: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName: string;
  permissionType: PermissionType;
};
