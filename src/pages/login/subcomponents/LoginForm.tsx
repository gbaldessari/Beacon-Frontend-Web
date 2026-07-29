import type { FormEvent, JSX } from "react";
import { AppButton, AppInput } from "../../../commons/components";

/**
 * Componente de formulario de inicio de sesión.
 *
 * @remarks
 * Renderiza campos controlados para email y contraseña, y un botón de envío con spinner de carga.
 *
 * @param props - Propiedades del componente.
 * @param props.email - Valor del campo email.
 * @param props.setEmail - Setter para el campo email.
 * @param props.password - Valor del campo contraseña.
 * @param props.setPassword - Setter para el campo contraseña.
 * @param props.loading - Indica si el formulario está en estado de carga.
 * @param props.handleSubmit - Función para manejar el envío del formulario.
 * @returns El formulario de login.
 */
export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
  onRecoverPassword,
  onSwitchToRegister,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onRecoverPassword: () => void;
  onSwitchToRegister: () => void;
}): JSX.Element {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="login-auth-form" onSubmit={handleSubmit} noValidate>
      <div className="login-auth-form-header">
        <h2>Bienvenido de nuevo</h2>
        <p>Usa tu correo y contraseña para continuar</p>
      </div>

      <div className="login-auth-field">
        <label htmlFor="login-email">Correo electrónico</label>
        <AppInput
          id="login-email"
          className="login-auth-input"
          type="email"
          value={email}
          placeholder="tu@correo.com"
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="login-auth-field">
        <label htmlFor="login-password">Contraseña</label>
        <AppInput
          id="login-password"
          className="login-auth-input"
          type="password"
          value={password}
          placeholder="••••••••"
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div className="login-auth-forgot">
        <button type="button" onClick={onRecoverPassword}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <AppButton variant="primary" className="login-auth-submit" type="submit" isLoading={loading}>
        Entrar
      </AppButton>

      <p className="login-auth-switch">
        ¿Aún no tienes cuenta?{" "}
        <button type="button" className="login-auth-link" onClick={onSwitchToRegister}>
          Créala aquí
        </button>
      </p>
    </form>
  );
}