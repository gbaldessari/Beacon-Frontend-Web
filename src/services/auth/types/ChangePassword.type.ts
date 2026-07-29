/**
 * Define el tipo de datos para la carga útil de cambio de contraseña.
 * Este tipo se utiliza para enviar la información necesaria al servidor al cambiar la contraseña de un usuario.
 * 
 * @property string currentPassword - Contraseña actual del usuario.
 * @property string newPassword - Nueva contraseña que el usuario desea establecer.
 */
export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};