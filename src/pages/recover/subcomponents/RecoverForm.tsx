import type { JSX } from "react";
import { AppButton, AppInput } from '../../../commons/components';

/**
 * Componente RecoverForm.
 * 
 * Renderiza el formulario para ingresar el email y solicitar la recuperación de contraseña.
 * Muestra un spinner de carga en el botón cuando loading es true.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.email - Valor del campo email.
 * @param {(email: string) => void} props.setEmail - Setter para el campo email.
 * @param {boolean} props.loading - Indica si el formulario está en estado de carga.
 * @param {() => void} props.handleSubmit - Función para manejar el envío del formulario.
 * 
 * @returns {JSX.Element} El formulario de recuperación.
 */
export function RecoverForm({
  email,
  setEmail,
  loading,
  handleSubmit,
}: {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  handleSubmit: () => void;
}): JSX.Element {
  return (
    <div className="auth-secondary-card">
      {/* Título y descripción */}
      <h1 className="auth-secondary-title">Recuperar Contraseña</h1>
      <p className="auth-secondary-description">
        Ingrese su correo electrónico para recuperar su contraseña
      </p>
      <div className="auth-secondary-form">
        {/* Campo de email */}
        <AppInput
          type="text"
          className="auth-secondary-input"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Botón de envío con spinner si loading */}
        <AppButton
          variant="primary"
          className={`auth-secondary-button ${loading ? "loading" : ""}`}
          onClick={handleSubmit}
          isLoading={loading}
        >
          Enviar Correo de Recuperación
        </AppButton>
      </div>
    </div>
  );
}