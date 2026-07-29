/**
 * Define el tipo de datos para la respuesta del servicio.
 * Este tipo se utiliza para representar la información devuelta por el servidor al realizar una solicitud.
 * 
 * @template T - Tipo de datos de la carga útil de respuesta del servicio.
 * 
 * @property boolean success - Indica si la solicitud fue exitosa o no.
 * @property T data - Datos devueltos por el servidor en caso de éxito.
 * @property string error - Mensaje de error devuelto por el servidor en caso de fallo.
 */
export type ServiceResponse<T> = {
	success: boolean;
	data?: T;
	error?: string;
}