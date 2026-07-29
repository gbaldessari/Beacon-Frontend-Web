/**
 * Define el tipo de datos para la carga útil de restablecimiento de contraseña.
 * Este tipo se utiliza para enviar la información necesaria al servidor al restablecer la contraseña de un usuario.
 * 
 * @property string email - Correo electrónico del usuario que solicita el restablecimiento de contraseña.
 * @property string recoveryCode - Código de recuperación enviado al correo electrónico del usuario.
 * @property string newPassword - Nueva contraseña que el usuario desea establecer.
 */
export type ResetPasswordPayload = {
  email: string;
  recoveryCode: string;
  newPassword: string;
}