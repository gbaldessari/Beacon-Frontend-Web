import type { JSX } from "react";
import { AppButton, AppInput, DotSpinner } from '../../../../../commons/components';

/**
 * Componente modal para editar el perfil del usuario.
 *
 * @remarks
 * Permite modificar el nombre y apellido del usuario, mostrando un formulario en un modal.
 *
 * @param props - Propiedades del componente.
 * @param props.open - Si el modal está abierto.
 * @param props.firstName - Valor del nombre.
 * @param props.lastName - Valor del apellido.
 * @param props.loading - Estado de carga.
 * @param props.onClose - Función para cerrar el modal.
 * @param props.onChangeFirstName - Setter para el nombre.
 * @param props.onChangeLastName - Setter para el apellido.
 * @param props.onSave - Función para guardar los cambios.
 * @returns El modal de edición de perfil o null si está cerrado.
 */
export function EditProfileModal({
  open,
  firstName,
  lastName,
  loading,
  onClose,
  onChangeFirstName,
  onChangeLastName,
  onSave,
}: {
  open: boolean;
  firstName: string;
  lastName: string;
  loading: boolean;
  onClose: () => void;
  onChangeFirstName: (v: string) => void;
  onChangeLastName: (v: string) => void;
  onSave: () => void;
}): JSX.Element | null {
  if (!open) return null;
  return (
    <div className="admin-window-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal admin-window-modal">
        <h2>Editar Perfil</h2>
        <div className="admin-window-modal-form">
          <div className="admin-window-modal-field">
            <label>Nombre</label>
            <AppInput
              type="text"
              value={firstName}
              onChange={e => onChangeFirstName(e.target.value)}
              className="admin-window-minimal-input"
              autoComplete="off"
              disabled={loading}
            />
          </div>
          <div className="admin-window-modal-field">
            <label>Apellido</label>
            <AppInput
              type="text"
              value={lastName}
              onChange={e => onChangeLastName(e.target.value)}
              className="admin-window-minimal-input"
              autoComplete="off"
              disabled={loading}
            />
          </div>
        </div>
        <div className="admin-window-modal-actions admin-window-modal-editprofile-actions">
          <AppButton
            variant="secondary"
            className={loading ? "admin-window-submit-button admin-window-loading" : "admin-window-submit-button"}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </AppButton>
          <AppButton
            variant="primary"
            className={loading ? "admin-window-submit-button admin-window-loading" : "admin-window-submit-button"}
            onClick={onSave}
            isLoading={loading}
          >
            {loading ? (
              <DotSpinner compact />
            ) : "Guardar"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}