/**
 * Componente para registrar un nuevo usuario.
 */
import { useEffect, useState, type MouseEvent } from "react";
import { AppButton, AppInput, AppSelect, DotSpinner } from '../../../../../commons/components';
import { getRoles } from "../../../../../services/auth/role.service";
import { getAccessToken } from "../../../../../services/auth/session";
import type { RoleDefinition } from "../../../../../services/auth/types/RoleDefinition.type";
import type { RegisterPayload } from '../../../../../services/auth/types/Register.type';

export function RegisterAdminSection({
  registerForm,
  setRegisterForm,
  loading,
  onRegister,
  isOpen,
  onOpenModal,
  onCloseModal,
}: {
  registerForm: RegisterPayload;
  setRegisterForm: (f: (prev: any) => any) => void;
  loading: boolean;
  onRegister: () => void;
  isOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}) {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);

  useEffect(() => {
    const loadRoles = async () => {
      const accessToken = getAccessToken() || "";
      const response = await getRoles(accessToken);
      if (response.success && response.data) {
        setRoles(response.data);
      }
    };

    void loadRoles();
  }, []);

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !loading) {
      onCloseModal();
    }
  };

  return (
    <>
      <div className="admin-window-minimal-section">
        <h2>Registrar Nuevo Usuario</h2>
        <p className="admin-window-action-description">
          Completa los datos básicos y asigna el rol que debe tener el nuevo usuario.
        </p>
        <AppButton
          variant="primary"
          className="admin-window-submit-button admin-window-action-trigger"
          onClick={onOpenModal}
          disabled={loading}
        >
          Abrir formulario
        </AppButton>
      </div>

      {isOpen && (
        <div className="admin-window-modal-overlay" onClick={handleOverlayClick}>
          <div className="modal admin-window-modal">
            <h3>Registro de usuario</h3>
            <div className="admin-window-modal-form">
              <div className="admin-window-modal-field">
                <label>Email</label>
                <AppInput
                  type="text"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                  className="admin-window-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <div className="admin-window-modal-field">
                <label>Nombre</label>
                <AppInput
                  type="text"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="admin-window-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <div className="admin-window-modal-field">
                <label>Apellido</label>
                <AppInput
                  type="text"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="admin-window-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <div className="admin-window-modal-field">
                <label>Contraseña</label>
                <AppInput
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                  className="admin-window-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
                <span className="admin-window-modal-note">
                  La contraseña debe cumplir las mismas reglas de seguridad del sistema.
                </span>
              </div>
              <div className="admin-window-modal-field">
                <label>Rol</label>
                <AppSelect
                  value={registerForm.role}
                  onChange={(e) => {
                    setRegisterForm((f) => ({
                      ...f,
                      role: e.target.value,
                    }));
                  }}
                  className="admin-window-minimal-input"
                  disabled={loading}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.code}>
                      {role.name}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>
            <div className="admin-window-modal-actions">
              <AppButton variant="secondary" className="admin-window-cancel-btn" onClick={onCloseModal} disabled={loading}>
                Cancelar
              </AppButton>
              <AppButton
                variant="primary"
                className={`admin-window-submit-button ${loading ? "admin-window-loading" : ""}`}
                onClick={onRegister}
                isLoading={loading}
              >
                {loading ? (
                  <DotSpinner compact />
                ) : (
                  "Registrar usuario"
                )}
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
