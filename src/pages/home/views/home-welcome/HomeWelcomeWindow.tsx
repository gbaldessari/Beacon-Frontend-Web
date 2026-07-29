/**
 * Componente de bienvenida para la vista principal.
 *
 * @remarks
 * Muestra una cuadrícula de botones para navegar a las principales secciones de la aplicación.
 *
 * @returns El menú de navegación principal.
 */
import { useNavigate } from "react-router-dom";
import { MdPerson, MdSettings } from "react-icons/md";
import "./homeWelcomeWindow.css";
import { useCurrentRole } from "../../../../services/auth/authRole";
import { HomeRouteConfig, hasRouteAccess } from "../../../../commons/utils/protectedPaths";

function HomeWelcomeWindow() {
  const navigate = useNavigate();
  const { roleName, permissionType, isAdmin, loading } = useCurrentRole();

  const handleNavigateToProfile = () => {
    navigate(HomeRouteConfig.PROFILE.navigatePath);
  };

  const roleDescription = isAdmin
    ? "Gestiona usuarios y perfiles para que Beacon siga claro y bajo control."
    : "Revisa tu cuenta y mantén tus datos al día para navegar con confianza.";

  const canAccessProfile = hasRouteAccess(permissionType, loading, HomeRouteConfig.PROFILE.allowedPermissionTypes);

  return (
    <div className="home-welcome-container">
      <div className="welcome-content">
        <h2 className="welcome-title">¿Qué quieres hacer ahora?</h2>
        <p className="welcome-subtitle">
          Empieza por lo esencial. Más herramientas de finanzas y hábitos llegarán pronto.
        </p>

        <div className="applications-grid">
          {canAccessProfile && (
            <button
              type="button"
              className="application-card profile-application"
              onClick={handleNavigateToProfile}
            >
              <div className="application-icon" aria-hidden="true">
                {isAdmin ? <MdSettings size={36} /> : <MdPerson size={36} />}
              </div>
              <h3>{isAdmin ? "Administración" : "Mi cuenta"}</h3>
              <p>{roleDescription}</p>
            </button>
          )}
        </div>

        <div className="user-permissions-info">
          <p>
            <strong>Rol activo:</strong> {roleName || "Sin asignar"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomeWelcomeWindow;
