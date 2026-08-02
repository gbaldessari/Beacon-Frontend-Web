import { useEffect, useMemo, useState } from "react";
import { AppButton, AppInput, AppModal, AppSelect, DotSpinner, ListSkeleton } from '../../../../../commons/components';
import { getUsers, deleteUser, updateUserRole, updateUserStatus } from "../../../../../services/auth/auth.service";
import { getRoles } from "../../../../../services/auth/role.service";
import type { GetUsersResponse } from "../../../../../services/auth/types/GetUsers.type";
import type { RoleDefinition } from "../../../../../services/auth/types/RoleDefinition.type";
import { FiAlertTriangle, FiSearch, FiTrash2 } from "react-icons/fi";
import { getAccessToken } from "../../../../../services/auth/session";
import { requestCurrentRoleRefresh } from "../../../../../services/auth/authRole";
import { Role } from "../../../../../services/auth/types/Role.type";

interface UsersManagementSectionProps {
  onShowAlert: (type: "success" | "error", message: string) => void;
  refreshToken: number;
}

const USERS_PER_PAGE = 8;
const isProtectedAdmin = (user: GetUsersResponse) => user.role.trim().toUpperCase() === Role.ADMIN;

/**
 * Sección administrativa para buscar, filtrar, activar/desactivar y eliminar usuarios.
 */
export function UsersManagementSection({ onShowAlert, refreshToken }: UsersManagementSectionProps) {
  const [users, setUsers] = useState<GetUsersResponse[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusUpdateUserId, setStatusUpdateUserId] = useState<string | null>(null);
  const [roleUpdateUserId, setRoleUpdateUserId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    userId: string;
    userName: string;
    loading: boolean;
  } | null>(null);

  const roleFilterOptions = useMemo(() => [
    { value: "ALL" as const, label: "Todos los roles" },
    ...roles.map((role) => ({ value: role.code, label: role.name })),
  ], [roles]);

  const activeFilterOptions: ReadonlyArray<{ value: "ALL" | "ACTIVE" | "INACTIVE"; label: string }> = [
    { value: "ALL", label: "Todos los estados" },
    { value: "ACTIVE", label: "Activos" },
    { value: "INACTIVE", label: "Inactivos" },
  ];

  const loadUsers = async () => {
    setLoading(true);
    const accessToken = getAccessToken() || "";
    const [usersResponse, rolesResponse] = await Promise.all([
      getUsers(accessToken),
      getRoles(accessToken),
    ]);

    if (rolesResponse.success && rolesResponse.data) {
      setRoles(rolesResponse.data);
    }

    if (usersResponse.success && usersResponse.data) {
      setUsers(usersResponse.data);
      setCurrentPage(1);
    } else {
      onShowAlert("error", "Error al cargar usuarios");
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, [refreshToken]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeleteModal({ userId, userName, loading: false });
  };

  const confirmDeleteUser = async () => {
    if (!deleteModal) return;

    setDeleteModal({ ...deleteModal, loading: true });
    const accessToken = getAccessToken() || "";

    const response = await deleteUser(accessToken, { id: deleteModal.userId });

    if (response.success) {
      setDeleteModal(null);
      await loadUsers();
      onShowAlert("success", "Usuario eliminado correctamente");
    } else {
      onShowAlert("error", "Error al eliminar usuario");
      setDeleteModal(null);
    }
  };

  const handleToggleUserStatus = async (user: GetUsersResponse) => {
    const nextIsActive = !user.isActive;
    setStatusUpdateUserId(user.id);

    const accessToken = getAccessToken() || "";
    const response = await updateUserStatus(accessToken, {
      id: user.id,
      isActive: nextIsActive,
    });

    if (response.success) {
      await loadUsers();
      onShowAlert(
        "success",
        nextIsActive
          ? "Usuario activado correctamente. Se envio una notificacion por correo."
          : "Usuario desactivado correctamente.",
      );
    } else {
      onShowAlert("error", response.error || "No fue posible actualizar el estado del usuario");
    }

    setStatusUpdateUserId(null);
  };

  const handleUpdateUserRole = async (user: GetUsersResponse, role: string) => {
    if (user.role === role) {
      return;
    }

    if (isProtectedAdmin(user)) {
      onShowAlert("error", "No es posible cambiar el rol de un usuario Administrador.");
      return;
    }

    setRoleUpdateUserId(user.id);

    const accessToken = getAccessToken() || "";
    const response = await updateUserRole(accessToken, {
      id: user.id,
      role,
    });

    if (response.success) {
      await loadUsers();
      requestCurrentRoleRefresh();
      onShowAlert("success", "Rol de usuario actualizado correctamente.");
    } else {
      onShowAlert("error", response.error || "No fue posible actualizar el rol del usuario");
    }

    setRoleUpdateUserId(null);
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const roleMatch = roleFilter === "ALL" || user.role === roleFilter;
      const activeMatch =
        activeFilter === "ALL"
          ? true
          : activeFilter === "ACTIVE"
            ? user.isActive
            : !user.isActive;

      if (!roleMatch || !activeMatch) {
        return false;
      }

      if (!normalizedSearchTerm) {
        return true;
      }

      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const roleLabel = user.roleName.toLowerCase();
      const activeLabel = user.isActive ? "activo" : "inactivo";

      return (
        fullName.includes(normalizedSearchTerm)
        || user.email.toLowerCase().includes(normalizedSearchTerm)
        || roleLabel.includes(normalizedSearchTerm)
        || activeLabel.includes(normalizedSearchTerm)
      );
    });
  }, [users, searchTerm, roleFilter, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, activeFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const currentStart = filteredUsers.length === 0 ? 0 : (currentPage - 1) * USERS_PER_PAGE + 1;
  const currentEnd = Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length);

  const showNoUsers = !loading && users.length === 0;
  const showNoResults = !loading && users.length > 0 && filteredUsers.length === 0;

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setActiveFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="admin-window-section">
      <h3 className="admin-window-section-title">Gestión de Usuarios</h3>

      <div className="admin-window-users-toolbar">
        <div className="admin-window-users-filters">
          <AppInput
            className="admin-window-minimal-input"
            type="text"
            placeholder="Buscar por nombre o correo"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <AppSelect
            className="admin-window-minimal-input"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            {roleFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AppSelect>

          <AppSelect
            className="admin-window-minimal-input"
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
          >
            {activeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AppSelect>

          <AppButton
            variant="secondary"
            className="admin-window-filter-reset"
            onClick={handleResetFilters}
            disabled={searchTerm.trim().length === 0 && roleFilter === "ALL" && activeFilter === "ALL"}
          >
            Limpiar filtros
          </AppButton>
        </div>

        <p className="admin-window-users-summary">
          {loading
            ? "Preparando listado…"
            : `Mostrando ${currentStart}-${currentEnd} de ${filteredUsers.length} usuario(s)`}
        </p>
      </div>

      <div className="admin-window-users-table-container">
        {loading ? (
          <ListSkeleton count={5} />
        ) : (
          <div className="admin-window-table-wrapper">
            <table className="admin-window-users-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Nombre Completo">
                      <div className="admin-window-user-info">
                        <span className="admin-window-user-name">{`${user.firstName} ${user.lastName}`}</span>
                      </div>
                    </td>
                    <td className="admin-window-user-email" data-label="Correo Electrónico">{user.email}</td>
                    <td data-label="Rol">
                      <AppSelect
                        className="admin-window-minimal-input"
                        value={user.role}
                        onChange={(event) => void handleUpdateUserRole(user, event.target.value)}
                        disabled={
                          !!deleteModal?.loading
                          || statusUpdateUserId === user.id
                          || roleUpdateUserId === user.id
                          || isProtectedAdmin(user)
                        }
                        title={
                          isProtectedAdmin(user)
                            ? "El rol Administrador no se puede modificar"
                            : "Modificar rol del usuario"
                        }
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.code}>
                            {role.name}
                          </option>
                        ))}
                      </AppSelect>
                    </td>
                    <td data-label="Estado">
                      <span className={`admin-window-static-badge ${user.isActive ? "admin-window-granted" : "admin-window-denied"}`}>
                        <span className="admin-window-toggle-icon">{user.isActive ? "●" : "○"}</span>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td data-label="Acciones">
                      <div className="admin-window-actions-cell">
                        <AppButton
                          variant={user.isActive ? "secondary" : "primary"}
                          className="admin-window-access-toggle"
                          onClick={() => handleToggleUserStatus(user)}
                          disabled={!!deleteModal?.loading || statusUpdateUserId === user.id || roleUpdateUserId === user.id}
                          isLoading={statusUpdateUserId === user.id}
                          title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.isActive ? "Desactivar" : "Activar"}
                        </AppButton>

                        <AppButton
                          variant="danger"
                          className="admin-window-delete-btn"
                          onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                          disabled={!!deleteModal?.loading || statusUpdateUserId === user.id || roleUpdateUserId === user.id}
                          title="Eliminar usuario"
                        >
                          <FiTrash2 size={16} />
                          Eliminar
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showNoUsers && (
          <div className="admin-window-no-users">
            <div className="admin-window-no-users-icon">👥</div>
            <p>No hay usuarios registrados</p>
            <small>Los nuevos usuarios aparecerán aquí una vez registrados</small>
          </div>
        )}

        {showNoResults && (
          <div className="admin-window-no-users">
            <div className="admin-window-no-users-icon"><FiSearch size={24} /></div>
            <p>No se encontraron coincidencias</p>
            <small>Ajuste los filtros para ampliar los resultados</small>
          </div>
        )}
      </div>

      {!loading && filteredUsers.length > 0 && (
        <div className="admin-window-users-pagination">
          <span className="admin-window-users-page-indicator">
            Página {currentPage} de {totalPages}
          </span>

          <div className="admin-window-users-pagination-actions">
            <AppButton
              variant="secondary"
              className="admin-window-pagination-button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </AppButton>

            <AppButton
              variant="secondary"
              className="admin-window-pagination-button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </AppButton>
          </div>
        </div>
      )}

      <AppModal
        open={Boolean(deleteModal)}
        title="Confirmar eliminación"
        onClose={() => {
          if (!deleteModal?.loading) {
            setDeleteModal(null);
          }
        }}
        className="admin-window-modal admin-window-delete-modal"
      >
        <div className="admin-window-modal-body">
          <div className="admin-window-warning-icon"><FiAlertTriangle size={22} /></div>
          <p>¿Está seguro de que desea eliminar al usuario:</p>
          <strong>{deleteModal?.userName}</strong>
          <p className="admin-window-warning-text">Esta acción no se puede deshacer.</p>
        </div>
        <div className="admin-window-modal-actions">
          <AppButton
            variant="secondary"
            className="admin-window-cancel-btn"
            onClick={() => setDeleteModal(null)}
            disabled={deleteModal?.loading}
          >
            Cancelar
          </AppButton>
          <AppButton
            variant="danger"
            className="admin-window-confirm-delete-btn"
            onClick={confirmDeleteUser}
            isLoading={Boolean(deleteModal?.loading)}
          >
            {deleteModal?.loading ? (
              <>
                <DotSpinner compact />
                Eliminando...
              </>
            ) : (
              "Eliminar usuario"
            )}
          </AppButton>
        </div>
      </AppModal>
    </div>
  );
}
