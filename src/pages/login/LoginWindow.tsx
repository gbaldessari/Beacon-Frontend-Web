/**
 * Componente de ventana de inicio de sesión.
 *
 * @remarks
 * Renderiza la ventana de login, valida los campos de email y contraseña,
 * muestra alertas de error o éxito y gestiona el flujo de autenticación y navegación.
 *
 * @component
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import "./loginWindow.css";
import { login, publicRegister } from "../../services/auth/auth.service";
import { z } from "zod";
import { AppAlert } from "../../commons/components";
import { LoginForm } from "./subcomponents/LoginForm";
import { RegisterForm } from "./subcomponents/RegisterForm";
import { getDefaultAuthenticatedPath } from "../../commons/utils/roleNavigation";
import type { PermissionType } from "../../services/auth/types/PermissionType.type";
import { setAccessToken } from "../../services/auth/session";
import { setCurrentRole, syncCurrentRole } from "../../services/auth/authRole";
import { setAuthProfile } from "../../services/auth/useAuthProfile";
import { useTheme } from "../../commons/theme/useTheme";

// Esquemas de validación para email y contraseña usando Zod
const emailSchema = z.email("Por favor, ingrese un correo electrónico válido.");
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(16, "La contraseña no puede tener más de 16 caracteres.")
  .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/\d/, "La contraseña debe incluir al menos un número.");

const firstNameSchema = z.string().trim().min(2, "Por favor, ingrese su nombre.");
const lastNameSchema = z.string().trim().min(2, "Por favor, ingrese su apellido.");

/**
 * LoginWindow
 * 
 * Componente principal para el inicio de sesión de usuarios.
 * Gestiona el estado de los campos, validación, alertas y navegación.
 */
function LoginWindow() {
  const [view, setView] = useState<"login" | "register">("login");

  // Estados para los campos y alertas
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark, toggleTheme } = useTheme();

  const resolvePostLoginPath = (permissionType?: PermissionType | null) => {
    const next = searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }
    return getDefaultAuthenticatedPath(permissionType);
  };

  /**
   * Maneja el envío del formulario de login.
   * Valida los campos y realiza la autenticación.
   */
  const handleSubmit = async () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
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

    setLoading(true);
    setShowError(false);

    const response = await login({ email, password });

    if (response.success) {
      setSuccess("Inicio de sesión exitoso.");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAuthProfile({
          firstName: response.data?.firstName,
          lastName: response.data?.lastName,
          role: response.data?.role,
          roleName: response.data?.roleName,
          permissionType: response.data?.permissionType,
          email,
        });
        if (response.data?.role && response.data?.roleName && response.data?.permissionType) {
          setCurrentRole({
            code: response.data.role,
            name: response.data.roleName,
            permissionType: response.data.permissionType,
          });
        }
        setAccessToken(response.data?.accessToken || null);
        void syncCurrentRole().then((currentRole) => {
          const permissionType = currentRole?.permissionType ?? (response.data?.permissionType as PermissionType | undefined);
          navigate(resolvePostLoginPath(permissionType));
          setLoading(false);
        });
      }, 1300);
    } else {
      const errorMessage = response.error || "Error al iniciar sesión.";
      setShowError(true);
      setError(errorMessage);
      setTimeout(() => setShowError(false), 2200);
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    try {
      firstNameSchema.parse(registerFirstName);
      lastNameSchema.parse(registerLastName);
      emailSchema.parse(registerEmail);
      passwordSchema.parse(registerPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.issues?.[0]?.message || "Datos de registro inválidos.");
      } else {
        setError("Datos de registro inválidos.");
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 2200);
      return;
    }

    setLoading(true);
    setShowError(false);

    const response = await publicRegister({
      firstName: registerFirstName.trim(),
      lastName: registerLastName.trim(),
      email: registerEmail.trim().toLowerCase(),
      password: registerPassword,
    });

    if (response.success) {
      setSuccess(
        "Solicitud recibida. Si el email es nuevo, tu cuenta quedara pendiente de activacion y recibiras un aviso por correo.",
      );
      setShowSuccess(true);
      setRegisterFirstName("");
      setRegisterLastName("");
      setRegisterPassword("");
      setEmail(registerEmail.trim().toLowerCase());
      setPassword("");
      setRegisterEmail("");
      setView("login");
      setTimeout(() => setShowSuccess(false), 2200);
    } else {
      setError(response.error || "No fue posible completar el registro.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2200);
    }

    setLoading(false);
  };

  /**
   * Navega a la pantalla de recuperación de contraseña.
   */
  const handleRecoverPassword = () => {
    navigate("/recover-password");
  };

  return (
    <div className="login-auth-page">
      {/* Alertas de error y éxito */}
      <AppAlert type="error" message={error} show={showError} />
      <AppAlert type="success" message={success} show={showSuccess} />

      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
        title={isDark ? "Modo claro" : "Modo oscuro"}
      >
        {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      <main className="login-auth-main">
        <div className="login-auth-stage">
          <header className="login-auth-brand">
            <img
              className="login-auth-brand-mark"
              src={isDark ? "/assets/logo-beacon-dark.png" : "/assets/logo-beacon.png"}
              alt=""
              width={220}
              height={94}
            />
            <h1>Beacon</h1>
          </header>

          <section className="login-auth-shell" aria-label="Acceso a Beacon">
            <div
              className={`login-auth-tabs ${view === "register" ? "is-register" : "is-login"}`}
              role="tablist"
              aria-label="Autenticación"
            >
              <button
                type="button"
                role="tab"
                aria-selected={view === "login"}
                className={`login-auth-tab ${view === "login" ? "is-active" : ""}`}
                onClick={() => setView("login")}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "register"}
                className={`login-auth-tab ${view === "register" ? "is-active" : ""}`}
                onClick={() => setView("register")}
              >
                Crear cuenta
              </button>
            </div>

            <div key={view} className="login-auth-panel">
              {view === "login" ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                  onSubmit={handleSubmit}
                  onRecoverPassword={handleRecoverPassword}
                  onSwitchToRegister={() => setView("register")}
                />
              ) : (
                <RegisterForm
                  firstName={registerFirstName}
                  setFirstName={setRegisterFirstName}
                  lastName={registerLastName}
                  setLastName={setRegisterLastName}
                  email={registerEmail}
                  setEmail={setRegisterEmail}
                  password={registerPassword}
                  setPassword={setRegisterPassword}
                  loading={loading}
                  onSubmit={handleRegisterSubmit}
                  onSwitchToLogin={() => setView("login")}
                />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default LoginWindow;