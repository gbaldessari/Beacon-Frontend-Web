import React from "react";
import { AppButton, DotSpinner } from '../../../../../commons/components';

/**
 * Componente modal de confirmación para acciones críticas.
 *
 * @remarks
 * Muestra un modal para confirmar acciones como actualizar perfil, cambiar contraseña o registrar usuario.
 *
 * @param props - Propiedades del componente.
 * @param props.confirmModal - Estado del modal de confirmación (tipo, función de confirmación y estado de carga).
 * @param props.setConfirmModal - Setter para el estado del modal.
 * @returns El modal de confirmación o null si no está activo.
 */
type ConfirmModalProps = {
  confirmModal: null | {
    type: "profile" | "password" | "register";
    onConfirm: () => void;
    loading: boolean;
  };
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModalProps["confirmModal"]>>;
};

/**
 * Componente ConfirmModal.
 * 
 * Modal de confirmación para acciones críticas (actualizar perfil, cambiar contraseña, registrar usuario).
 * 
 * @param {Object} props
 * @param {object|null} props.confirmModal - Estado del modal de confirmación.
 * @param {React.Dispatch} props.setConfirmModal - Setter para el estado del modal.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({ confirmModal, setConfirmModal }) => {
  if (!confirmModal) return null;
  let title = "";
  let message = "";
  if (confirmModal.type === "profile") {
    title = "Confirmar actualización de perfil";
    message = "¿Deseas guardar los cambios en tu perfil?";
  } else if (confirmModal.type === "password") {
    title = "Confirmar cambio de contraseña";
    message = "¿Deseas cambiar tu contraseña?";
  } else if (confirmModal.type === "register") {
    title = "Confirmar registro de usuario";
    message = "¿Deseas registrar este nuevo usuario?";
  }
  return (
    <div className="admin-window-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setConfirmModal(null); }}>
      <div className="modal admin-window-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="admin-window-modal-actions admin-window-modal-confirm-actions">
          <AppButton
            variant="secondary"
            className={confirmModal.loading ? "admin-window-submit-button admin-window-loading" : "admin-window-submit-button"}
            onClick={() => setConfirmModal(null)}
            disabled={confirmModal.loading}
          >
            Cancelar
          </AppButton>
          <AppButton
            variant="primary"
            className={confirmModal.loading ? "admin-window-submit-button admin-window-loading" : "admin-window-submit-button"}
            onClick={confirmModal.onConfirm}
            isLoading={confirmModal.loading}
          >
            {confirmModal.loading ? (
              <DotSpinner compact />
            ) : "Confirmar"}
          </AppButton>
        </div>
      </div>
    </div>
  );
};