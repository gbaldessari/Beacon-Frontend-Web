/**
 * Componente RecoverPassword.
 * 
 * Renderiza la ventana para recuperar la contraseña del usuario.
 * Valida el email, muestra alertas y gestiona el flujo de recuperación.
 * 
 * @component
 */

import { useState } from "react";
import "./recoverPasswordWindow.css";
import { recoverPassword } from "../../services/auth/auth.service";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AppAlert, Navbar } from "../../commons/components";
import { RecoverForm } from "./subcomponents/RecoverForm";

// Esquema de validación para el email usando Zod
const emailSchema = z.string().email("Por favor, ingrese un correo electrónico válido.");

/**
 * RecoverPasswordWindow
 * 
 * Componente principal para la recuperación de contraseña.
 * Gestiona el estado del email, validación, alertas y navegación.
 */
function RecoverPasswordWindow() {
  // Estados para el email, alertas y carga
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario de recuperación.
   * Valida el email y realiza la petición de recuperación.
   */
  const handleSubmit = async () => {
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.issues?.[0]?.message || "Correo electrónico inválido.");
      } else {
        setError("Correo electrónico inválido.");
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    setLoading(true);
    setShowError(false);

    const response = await recoverPassword({ email });

    if (response.success) {
      setSuccess("Correo de recuperación enviado con éxito.");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        localStorage.setItem("recoverEmail", email);
        navigate("/reset-password");
        setLoading(false);
      }, 2000);
    } else {
      setError("Error al enviar el correo de recuperación.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setLoading(false);
    }
  };

  return (
    <div className="recover-auth-page">
      {/* Alertas de éxito y error */}
      <AppAlert type="success" message={success} show={showSuccess} />
      <AppAlert type="error" message={error} show={showError} />
      <Navbar />

      <main className="recover-auth-main">
        <section className="recover-auth-hero">
          <div className="recover-auth-container">
            <h1>Recuperar acceso</h1>
            <p>Te enviamos un código seguro para volver a tu faro sin perder el rumbo.</p>
          </div>
        </section>

        <section className="recover-auth-section">
          <RecoverForm
            email={email}
            setEmail={setEmail}
            loading={loading}
            handleSubmit={handleSubmit}
          />
        </section>
      </main>
    </div>
  );
}

export default RecoverPasswordWindow;