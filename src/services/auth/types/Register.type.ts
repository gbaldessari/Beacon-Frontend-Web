/**
 * Define el tipo de datos para la carga útil de registro.
 * Este tipo se utiliza para enviar la información necesaria al servidor al registrar un nuevo usuario.
 * 
 * @property string firstName - Nombre del usuario.
 * @property string lastName - Apellido del usuario.
 * @property string email - Correo electrónico del usuario.
 * @property string password - Contraseña del usuario.
 */
export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}