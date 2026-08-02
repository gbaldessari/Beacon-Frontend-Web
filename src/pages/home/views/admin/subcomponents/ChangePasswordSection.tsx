/**
 * Componente para cambiar la contraseña del usuario.
 *
 * @remarks
 * Permite al usuario ingresar su contraseña actual y una nueva contraseña, mostrando un botón con spinner de carga.
 *
 * @param props - Propiedades del componente.
 * @param props.currentPassword - Contraseña actual.
 * @param props.newPassword - Nueva contraseña.
 * @param props.setCurrentPassword - Setter para la contraseña actual.
 * @param props.setNewPassword - Setter para la nueva contraseña.
 * @param props.loading - Estado de carga del botón.
 * @param props.onChangePassword - Función para cambiar la contraseña.
 * @returns El formulario para cambiar la contraseña.
 */
import { AppButton, AppInput, AppModal, DotSpinner } from '../../../../../commons/components';

export function ChangePasswordSection({
  currentPassword,
  newPassword,
  setCurrentPassword,
  setNewPassword,
  loading,
  onChangePassword,
  isOpen,
  onOpenModal,
  onCloseModal,
}: {
  currentPassword: string;
  newPassword: string;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  loading: boolean;
  onChangePassword: () => void;
  isOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}) {
  return (
    <>
      <div className="admin-window-minimal-section">
        <h2>Cambiar Contraseña</h2>
        <p className="admin-window-action-description">
          Si quieres cambiarla, ábrelo acá.
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

      <AppModal
        open={isOpen}
        title="Actualizar contraseña"
        onClose={() => {
          if (!loading) {
            onCloseModal();
          }
        }}
        className="admin-window-modal"
      >
        <div className="admin-window-modal-form">
          <div className="admin-window-modal-field">
            <label>Contraseña actual</label>
            <AppInput
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="admin-window-minimal-input"
              autoComplete="off"
              disabled={loading}
            />
          </div>
          <div className="admin-window-modal-field">
            <label>Nueva contraseña</label>
            <AppInput
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="admin-window-minimal-input"
              autoComplete="off"
              disabled={loading}
            />
            <span className="admin-window-modal-note">
              Debe tener 8-16 caracteres e incluir letras y números.
            </span>
          </div>
        </div>
        <div className="admin-window-modal-actions">
          <AppButton variant="secondary" className="admin-window-cancel-btn" onClick={onCloseModal} disabled={loading}>
            Cancelar
          </AppButton>
          <AppButton
            variant="primary"
            className="admin-window-submit-button"
            onClick={onChangePassword}
            isLoading={loading}
          >
            {loading ? (
              <DotSpinner compact />
            ) : (
              "Cambiar contraseña"
            )}
          </AppButton>
        </div>
      </AppModal>
    </>
  );
}
