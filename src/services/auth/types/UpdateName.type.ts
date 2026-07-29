/**
 * Define el tipo de datos para la carga útil de actualización de nombre.
 * Este tipo se utiliza para enviar la información necesaria al servidor al actualizar el nombre de un usuario.
 * 
 * @property string firstName - Nuevo nombre del usuario.
 * @property string lastName - Nuevo apellido del usuario.
 */
export type UpdateNamePayload = {
  firstName: string;
  lastName: string;
};