/**
 * Componente principal de la vista de administración.
 *
 * @remarks
 * Permite editar el perfil, cambiar la contraseña, registrar nuevos administradores y gestionar usuarios.
 * Gestiona modales de confirmación y edición, validaciones y alertas.
 *
 * @component
 * @returns La vista de administración de usuarios y perfil.
 */
import { useState } from "react";
import "./adminWindow.css";
import { z } from "zod";
import { ProfileSection } from "./subcomponents/ProfileSection";
import { ChangePasswordSection } from "./subcomponents/ChangePasswordSection";
import { NotificationsSection } from "./subcomponents/NotificationsSection";
import { RegisterAdminSection } from "./subcomponents/RegisterAdminSection";
import { UsersManagementSection } from "./subcomponents/UsersManagementSection";
import { ConfirmModal } from "./subcomponents/ConfirmModal";
import { EditProfileModal } from "./subcomponents/EditProfileModal";
import { changePassword, register, updateName } from "../../../../services/auth/auth.service";
import { AppAlert, PageSkeleton } from "../../../../commons/components";
import { Role } from "../../../../services/auth/types/Role.type";
import { useCurrentRole } from "../../../../services/auth/authRole";
import type { RegisterPayload } from "../../../../services/auth/types/Register.type";
import { getAccessToken } from "../../../../services/auth/session";
import { setAuthProfile, useAuthProfile } from "../../../../services/auth/useAuthProfile";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(16, "La contraseña no puede tener más de 16 caracteres.")
  .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/\d/, "La contraseña debe incluir al menos un número.");

const emailSchema = z.string().email("Por favor, ingrese un correo electrónico válido.");

/**
 * AdminWindow
 * 
 * Componente principal para la administración de usuarios y perfil.
 * Gestiona el estado de los formularios, modales, validaciones y alertas.
 */
function AdminWindow() {
  const {
    firstName,
    lastName,
    email,
    loading: profileLoading,
  } = useAuthProfile();
  const { roleName, isAdmin, loading: roleLoading } = useCurrentRole();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [registerForm, setRegisterForm] = useState<RegisterPayload>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: Role.ADMIN,
  });
  const [usersRefreshToken, setUsersRefreshToken] = useState(0);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  // Estados para modales de confirmación
  const [confirmModal, setConfirmModal] = useState<null | {
    type: "profile" | "password" | "register";
    onConfirm: () => void;
    loading: boolean;
  }>(null);

  // Estado para el modal de edición de perfil
  const [editProfileModal, setEditProfileModal] = useState<null | {
    firstName: string;
    lastName: string;
    loading: boolean;
  }>(null);

  // Función para abrir el modal de edición de perfil
  const handleOpenEditProfile = () => {
    setEditProfileModal({
      firstName,
      lastName,
      loading: false,
    });
  };

  const handleClosePasswordModal = () => {
    if (loadingPassword) return;
    setPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleCloseRegisterModal = () => {
    if (registerLoading) return;
    setRegisterModalOpen(false);
  };



  // Función para guardar cambios desde el modal
  const handleSaveProfileModal = async () => {
    if (!editProfileModal) return;
    setEditProfileModal({ ...editProfileModal, loading: true });
    if (!editProfileModal.firstName || !editProfileModal.lastName) {
      setErrorMessage("Por favor, complete ambos campos de nombre.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setEditProfileModal(editProfileModal => editProfileModal && { ...editProfileModal, loading: false });
      return;
    }
    const accessToken = getAccessToken() || "";
    const response = await updateName(accessToken, {
      firstName: editProfileModal.firstName,
      lastName: editProfileModal.lastName,
    });
    if (response.success) {
      setSuccessMessage("Perfil actualizado con éxito.");
      setShowSuccess(true);
      setAuthProfile({
        firstName: editProfileModal.firstName,
        lastName: editProfileModal.lastName,
      });
      if (isAdmin) {
        setUsersRefreshToken((prev) => prev + 1);
      }
    } else {
      setErrorMessage("Error al actualizar el perfil.");
      setShowError(true);
    }
    setEditProfileModal(null);
    setTimeout(() => {
      setShowSuccess(false);
      setShowError(false);
    }, 2000);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      setErrorMessage("Por favor, complete ambos campos de contraseña.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    try {
      passwordSchema.parse(newPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrorMessage(e.issues?.[0]?.message || "Contraseña inválida.");
      } else {
        setErrorMessage("Contraseña inválida.");
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    setPasswordModalOpen(false);
    setConfirmModal({
      type: "password",
      onConfirm: async () => {
        setConfirmModal((prev) => prev && { ...prev, loading: true });
        setLoadingPassword(true);
        const accessToken = getAccessToken() || "";
        const response = await changePassword(accessToken, { currentPassword, newPassword });
        if (response.success) {
          setSuccessMessage("Contraseña cambiada con éxito.");
          setShowSuccess(true);
          setCurrentPassword("");
          setNewPassword("");
        } else {
          setErrorMessage("Error al cambiar la contraseña.");
          setShowError(true);
        }
        setLoadingPassword(false);
        setTimeout(() => {
          setShowSuccess(false);
          setShowError(false);
        }, 2000);
        setConfirmModal(null);
      },
      loading: false,
    });
  };

  const handleRegisterUser = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!registerForm.firstName || !registerForm.lastName) {
      setErrorMessage("Por favor, complete nombre y apellido.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    try {
      emailSchema.parse(registerForm.email);
      passwordSchema.parse(registerForm.password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrorMessage(e.issues?.[0]?.message || "Datos inválidos.");
      } else {
        setErrorMessage("Datos inválidos.");
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    setRegisterModalOpen(false);
    setConfirmModal({
      type: "register",
      onConfirm: async () => {
        setConfirmModal((prev) => prev && { ...prev, loading: true });
        setRegisterLoading(true);
        const accessToken = getAccessToken() || "";
        const response = await register(accessToken, {
          ...registerForm,
          firstName: registerForm.firstName.trim(),
          lastName: registerForm.lastName.trim(),
          email: registerForm.email.trim().toLowerCase(),
        });
        if (response.success) {
          setSuccessMessage("Usuario registrado exitosamente.");
          setShowSuccess(true);
          setUsersRefreshToken((prev) => prev + 1);
          setRegisterForm({
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            role: Role.ADMIN,
          });
        } else {
          setErrorMessage(response.error || "Error al registrar usuario.");
          setShowError(true);
        }
        setRegisterLoading(false);
        setTimeout(() => {
          setShowSuccess(false);
          setShowError(false);
        }, 2000);
        setConfirmModal(null);
      },
      loading: false,
    });
  };

  // Nueva función para mostrar alertas desde componentes hijos
  const handleShowAlert = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMessage(message);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrorMessage(message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  if (roleLoading || profileLoading) {
    return <PageSkeleton variant="admin" />;
  }

  return (
    <>
      {/* Alertas de éxito y error */}
      <AppAlert type="success" message={successMessage} show={showSuccess} />
      <AppAlert type="error" message={errorMessage} show={showError} />
      <div className="admin-window-body">
        <div className="admin-window-minimal">
          {/* Sección de perfil - siempre visible */}
          <ProfileSection
            firstName={firstName}
            lastName={lastName}
            email={email}
            loading={profileLoading || editProfileModal?.loading || false}
            onUpdate={handleOpenEditProfile}
          />
          {/* Sección para cambiar contraseña - siempre visible */}
          <ChangePasswordSection
            currentPassword={currentPassword}
            newPassword={newPassword}
            setCurrentPassword={setCurrentPassword}
            setNewPassword={setNewPassword}
            loading={loadingPassword}
            onChangePassword={handleChangePassword}
            isOpen={passwordModalOpen}
            onOpenModal={() => setPasswordModalOpen(true)}
            onCloseModal={handleClosePasswordModal}
          />
          <NotificationsSection onShowAlert={handleShowAlert} />
          {/* Sección para registrar nuevo administrador - solo para admins */}
          {isAdmin && (
            <RegisterAdminSection
              registerForm={registerForm}
              setRegisterForm={setRegisterForm}
              loading={registerLoading}
              onRegister={handleRegisterUser}
              isOpen={registerModalOpen}
              onOpenModal={() => setRegisterModalOpen(true)}
              onCloseModal={handleCloseRegisterModal}
            />)}
          {/* Modal de confirmación para acciones críticas */}
          <ConfirmModal
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
          />
        </div>
        {isAdmin && (
          <UsersManagementSection
            onShowAlert={handleShowAlert}
            refreshToken={usersRefreshToken}
          />
        )}
        {/* Información para usuarios normales */}
        {!isAdmin && (
          <div className="admin-window-section">
            <h3 className="admin-window-section-title">Mi Cuenta</h3>
            <div className="admin-window-user-info-section">
              <div className="admin-window-user-info-card">
                <div className="admin-window-user-info-header">
                  <div className="admin-window-user-avatar-large">
                    {firstName.charAt(0)}{lastName.charAt(0)}
                  </div>
                  <div className="admin-window-user-details">
                    <h4>{firstName} {lastName}</h4>
                    <p>{email}</p>
                    <span className="admin-window-user-role">{roleName || "Usuario"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal de edición de perfil */}
        <EditProfileModal
          open={!!editProfileModal}
          firstName={editProfileModal?.firstName || ""}
          lastName={editProfileModal?.lastName || ""}
          loading={editProfileModal?.loading || false}
          onClose={() => setEditProfileModal(null)}
          onChangeFirstName={v => setEditProfileModal(modal => modal && { ...modal, firstName: v })}
          onChangeLastName={v => setEditProfileModal(modal => modal && { ...modal, lastName: v })}
          onSave={handleSaveProfileModal}
        />
      </div>
    </>
  );
}

export default AdminWindow;