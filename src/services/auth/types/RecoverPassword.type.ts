/**
 * Define el tipo de datos para la carga útil de recuperación de contraseña.
 * Este tipo se utiliza para enviar la información necesaria al servidor al solicitar la recuperación de contraseña.
 * 
 * @property string email - Correo electrónico del usuario que solicita la recuperación de contraseña.
 */
export type RecoverPasswordPayload = {
  email: string;
};