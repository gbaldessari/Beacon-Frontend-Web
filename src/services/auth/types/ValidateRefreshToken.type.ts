/**
 * Define el tipo de datos para la carga útil de validación de token de actualización.
 * Este tipo se utiliza para enviar la información necesaria al servidor al validar un token de actualización.
 * 
 * El refresh token se envía automáticamente como cookie HttpOnly.
 */
export type ValidateRefreshTokenPayload = Record<string, never>;

/**
 * Define el tipo de datos para la respuesta de validación de token de actualización.
 * Este tipo se utiliza para recibir la información necesaria del servidor después de validar un token de actualización.
 * 
 * @property string accessToken - Nuevo token de acceso generado al validar el token de actualización.
 */
export type ValidateRefreshTokenResponse = {
  accessToken: string;
}