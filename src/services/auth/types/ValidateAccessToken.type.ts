/**
 * Define el tipo de datos para la respuesta de validación del token de acceso.
 * Este tipo se utiliza para representar la información devuelta por el servidor al validar un token de acceso.
 * 
 * @property Date expiresAt - Fecha y hora de expiración del token de acceso.
 */
export interface ValidateAccessTokenResponse {
  expiresAt: Date;
}