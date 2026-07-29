/**
 * Payload enviado por el registro público antes de que un administrador active la cuenta.
 */
export type PublicRegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
