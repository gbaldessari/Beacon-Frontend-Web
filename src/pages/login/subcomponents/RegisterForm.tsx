import type { FormEvent, JSX } from "react";
import { AppButton, AppInput } from "../../../commons/components";

/**
 * Formulario de registro público.
 *
 * Mantiene campos controlados para identidad, credenciales,
 * delegando validación y envío a la vista contenedora.
 */
export function RegisterForm({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
  onSwitchToLogin,
}: {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onSwitchToLogin: () => void;
}): JSX.Element {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="login-auth-form" onSubmit={handleSubmit} noValidate>
      <div className="login-auth-form-header">
        <h2>Únete a Beacon</h2>
        <p>Cuéntanos quién eres y elige una contraseña segura</p>
      </div>

      <div className="login-auth-name-row">
        <div className="login-auth-field">
          <label htmlFor="register-first-name">Nombre</label>
          <AppInput
            id="register-first-name"
            className="login-auth-input"
            type="text"
            value={firstName}
            placeholder="Juan"
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
          />
        </div>

        <div className="login-auth-field">
          <label htmlFor="register-last-name">Apellido</label>
          <AppInput
            id="register-last-name"
            className="login-auth-input"
            type="text"
            value={lastName}
            placeholder="Pérez"
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="login-auth-field">
        <label htmlFor="register-email">Correo electrónico</label>
        <AppInput
          id="register-email"
          className="login-auth-input"
          type="email"
          value={email}
          placeholder="tu@correo.com"
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
      </div>

      <div className="login-auth-field">
        <label htmlFor="register-password">Contraseña</label>
        <AppInput
          id="register-password"
          className="login-auth-input"
          type="password"
          value={password}
          placeholder="Mín. 8 caracteres"
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
      </div>

      <AppButton variant="primary" className="login-auth-submit" type="submit" isLoading={loading}>
        Crear mi cuenta
      </AppButton>

      <p className="login-auth-switch">
        ¿Ya tienes cuenta?{" "}
        <button type="button" className="login-auth-link" onClick={onSwitchToLogin}>
          Entra aquí
        </button>
      </p>
    </form>
  );
}
