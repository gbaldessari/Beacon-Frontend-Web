import type { JSX } from "react";
import { AppInput } from '../../../commons/components';

/**
 * Componente ResetPasswordInputs.
 * 
 * Renderiza los campos de entrada para el código de recuperación, nueva contraseña y confirmación.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.recoveryCode - Código de recuperación.
 * @param {string} props.newPassword - Nueva contraseña.
 * @param {string} props.confirmPassword - Confirmación de la nueva contraseña.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onRecoveryCodeChange - Handler para el código.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onNewPasswordChange - Handler para la nueva contraseña.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} props.onConfirmPasswordChange - Handler para la confirmación.
 * 
 * @returns {JSX.Element} Los inputs del formulario de restablecimiento.
 */
export function ResetPasswordInputs({
  recoveryCode,
  newPassword,
  confirmPassword,
  onRecoveryCodeChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
}: {
  recoveryCode: string;
  newPassword: string;
  confirmPassword: string;
  onRecoveryCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element {
  return (
    <>
      {/* Campo de código de recuperación */}
      <AppInput
        type="text"
        className="reset-input"
        placeholder="Código de Recuperación"
        value={recoveryCode}
        onChange={onRecoveryCodeChange}
        maxLength={6}
        autoComplete="off"
      />
      {/* Campo de nueva contraseña */}
      <AppInput
        type="password"
        className="reset-input"
        placeholder="Nueva Contraseña"
        value={newPassword}
        onChange={onNewPasswordChange}
        autoComplete="off"
      />
      {/* Campo de confirmación de contraseña */}
      <AppInput
        type="password"
        className="reset-input"
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        autoComplete="off"
      />
    </>
  );
}