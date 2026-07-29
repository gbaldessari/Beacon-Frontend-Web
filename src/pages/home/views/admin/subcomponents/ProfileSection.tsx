import { AppButton, AppInput, DotSpinner } from '../../../../../commons/components';

/**
 * Componente para mostrar la información del perfil del usuario.
 *
 * @remarks
 * Muestra el email, nombre y apellido del usuario, y permite abrir el modal de edición.
 *
 * @param props - Propiedades del componente.
 * @param props.firstName - Nombre del usuario.
 * @param props.lastName - Apellido del usuario.
 * @param props.email - Email del usuario.
 * @param props.onUpdate - Función para abrir el modal de edición.
 * @param props.loading - Estado de carga del botón.
 * @returns El formulario de perfil del usuario.
 */
export function ProfileSection({
  firstName,
  lastName,
  email,
  onUpdate,
  loading,
}: {
  firstName: string;
  lastName: string;
  email: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  onUpdate: () => void;
  loading: boolean;
}) {
  return (
    <div className="admin-window-minimal-section">
      <h2>Perfil</h2>
      <div className="admin-window-minimal-row">
        <label>Email:</label>
        <AppInput type="text" value={email} disabled className="admin-window-minimal-input" />
      </div>
      <div className="admin-window-minimal-row">
        <label>Nombre:</label>
        <AppInput
          type="text"
          value={firstName}
          className="admin-window-minimal-input"
          disabled
        />
      </div>
      <div className="admin-window-minimal-row">
        <label>Apellido:</label>
        <AppInput
          type="text"
          value={lastName}
          className="admin-window-minimal-input"
          disabled
        />
      </div>
      <AppButton
        variant="primary"
        className={`admin-window-submit-button ${loading ? "admin-window-loading" : ""}`}
        onClick={onUpdate}
        disabled={loading}
      >
        {loading ? (
          <DotSpinner compact />
        ) : (
          "Actualizar Perfil"
        )}
      </AppButton>
    </div>
  );
}