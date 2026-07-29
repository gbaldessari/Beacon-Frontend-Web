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
    ? "Administra usuarios, actualiza perfiles y supervisa la operación desde un solo lugar."
    : "Consulta tu información de cuenta y mantén tus datos personales actualizados.";

  const canAccessProfile = hasRouteAccess(permissionType, loading, HomeRouteConfig.PROFILE.allowedPermissionTypes);

  return (
    <div className="home-welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Bienvenido</h1>

        <div className="applications-grid">

          {canAccessProfile && (
            <div
              className="application-card profile-application"
              onClick={handleNavigateToProfile}
            >
              <div className="application-icon">
                {isAdmin ? <MdSettings size={36} /> : <MdPerson size={36} />}
              </div>
              <h3>{isAdmin ? "Panel de administración" : "Mi cuenta"}</h3>
              <p>{roleDescription}</p>
            </div>
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