import type { JSX } from "react";
import { AppButton } from '../../../commons/components';
import { ResetPasswordInputs } from "./ResetPasswordInputs";

/**
 * Componente ResetPasswordBlock.
 * 
 * Renderiza la ventana y el formulario para restablecer la contraseña,
 * incluyendo los campos de código de recuperación, nueva contraseña y confirmación.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.recoveryCode - Código de recuperación.
 * @param {string} props.newPassword - Nueva contraseña.
 * @param {string} props.confirmPassword - Confirmación de la nueva contraseña.
 * @param {boolean} props.loading - Indica si el formulario está en estado de carga.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onRecoveryCodeChange - Handler para el código.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onNewPasswordChange - Handler para la nueva contraseña.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onConfirmPasswordChange - Handler para la confirmación.
 * @param {() => void} props.onSubmit - Función para manejar el envío del formulario.
 * 
 * @returns {JSX.Element} El formulario de restablecimiento.
 */
export function ResetPasswordBlock({
  recoveryCode,
  newPassword,
  confirmPassword,
  loading,
  onRecoveryCodeChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: {
  recoveryCode: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  onRecoveryCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}): JSX.Element {
  return (
    <div className="reset-window">
      {/* Título y descripción */}
      <h1 className="reset-title">Restablecer Contraseña</h1>
      <p className="reset-description">
        Ingrese el código de recuperación y su nueva contraseña.
      </p>
      <div className="reset-form">
        {/* Inputs del formulario */}
        <ResetPasswordInputs
          recoveryCode={recoveryCode}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onRecoveryCodeChange={onRecoveryCodeChange}
          onNewPasswordChange={onNewPasswordChange}
          onConfirmPasswordChange={onConfirmPasswordChange}
        />
        {/* Botón de envío con spinner si loading */}
        <AppButton
          variant="primary"
          className={`reset-button ${loading ? "loading" : ""}`}
          isLoading={loading}
          onClick={onSubmit}
        >
          Restablecer Contraseña
        </AppButton>
      </div>
    </div>
  );
}