/**
 * Componente ResetPasswordWindow.
 * 
 * Renderiza la ventana para restablecer la contraseña del usuario.
 * Valida el código de recuperación y la nueva contraseña, muestra alertas y gestiona el flujo de restablecimiento.
 * 
 * @component
 */

import { useState } from "react";
import "../auth/authSecondaryWindow.css";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/auth/auth.service";
import { z } from "zod";
import { AppAlert, Navbar } from "../../commons/components";
import { ResetPasswordBlock } from "./subcomponents/ResetPasswordBlock";

// Esquema de validación para el código de recuperación usando Zod
const recoveryCodeSchema = z
  .string()
  .regex(/^[A-Z0-9]{6}$/, "El código de recuperación debe tener exactamente 6 caracteres alfanuméricos en mayúsculas.");

// Esquema de validación para la nueva contraseña usando Zod
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(16, "La contraseña no puede tener más de 16 caracteres.")
  .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/\d/, "La contraseña debe incluir al menos un número.");

/**
 * ResetPasswordWindow
 * 
 * Componente principal para el restablecimiento de contraseña.
 * Gestiona el estado de los campos, validación, alertas y navegación.
 */
function ResetPasswordWindow() {
  // Estados para los campos, alertas y carga
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario de restablecimiento.
   * Valida los campos y realiza la petición de restablecimiento.
   */
  const handleSubmit = async () => {
    try {
      recoveryCodeSchema.parse(recoveryCode);
      passwordSchema.parse(newPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.issues?.[0]?.message || "Datos inválidos.");
      } else {
        setError("Datos inválidos.");
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    setLoading(true);
    setShowError(false);

    const response = await resetPassword({
      email: localStorage.getItem("recoverEmail") || "",
      recoveryCode,
      newPassword,
    });

    if (response.success) {
      setSuccess("Contraseña restablecida con éxito.");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setLoading(false);
        localStorage.removeItem("recoverEmail");
        navigate("/login");
      }, 2000);
    } else {
      setError("Error al restablecer la contraseña.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setLoading(false);
    }
  };

  /**
   * Maneja el cambio del código de recuperación, forzando mayúsculas.
   */
  const handleRecoveryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setRecoveryCode(value);
  };

  return (
    <div className="auth-shell-page">
      {/* Alertas de éxito y error */}
      <AppAlert type="success" message={success} show={showSuccess} />
      <AppAlert type="error" message={error} show={showError} />
      <Navbar />

      <main className="auth-shell-main">
        <section className="auth-shell-hero auth-secondary-hero">
          <div className="auth-shell-container">
            <h1>Nueva contraseña</h1>
            <p>Usa tu código de recuperación y define una clave segura para seguir adelante.</p>
          </div>
        </section>

        <section className="auth-secondary-section">
          <ResetPasswordBlock
            recoveryCode={recoveryCode}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            loading={loading}
            onRecoveryCodeChange={handleRecoveryCodeChange}
            onNewPasswordChange={(e) => setNewPassword(e.target.value)}
            onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
            onSubmit={handleSubmit}
          />
        </section>
      </main>
    </div>
  );
}

export default ResetPasswordWindow;