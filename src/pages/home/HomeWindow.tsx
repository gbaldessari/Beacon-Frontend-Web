import "./homeWindow.css";
import { Outlet, useLocation } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { handleLogout } from "../../commons/utils/HandleLogout";
import { AppAlert, AppButton, Navbar } from "../../commons/components";
import { useMemo, useState } from "react";
import { useAuthProfile } from "../../services/auth/useAuthProfile";
import { useCurrentRole } from "../../services/auth/authRole";
import { ProtectedPaths } from "../../commons/utils/protectedPaths";

type HeroContent = {
  eyebrow: string;
  title: string;
  lead: string;
};

/**
 * Layout principal para rutas autenticadas de home.
 *
 * Renderiza la barra superior, hero adaptado a cada ventana, outlet de
 * subrutas y acción de cierre de sesión.
 */
function HomeWindow() {
  const [showAlert, setShowAlert] = useState(false);
  const { firstName } = useAuthProfile();
  const { isAdmin } = useCurrentRole();
  const { pathname } = useLocation();

  const logoutWithAlert = () => {
    setShowAlert(true);
    handleLogout();
  };

  const hero = useMemo((): HeroContent => {
    const greetingName = firstName?.trim();
    const greeting = greetingName ? `Hola, ${greetingName}` : "Hola de nuevo";

    if (pathname.startsWith(ProtectedPaths.HOME_TASKS)) {
      return {
        eyebrow: "Tareas",
        title: "Tus recordatorios",
        lead: "Lo que tienes pendiente, con fecha y aviso si hace falta.",
      };
    }

    if (pathname.startsWith(ProtectedPaths.HOME_FINANCE)) {
      return {
        eyebrow: "Finanzas",
        title: "Tu dinero",
        lead: "Movimientos, presupuestos y metas, a tu ritmo.",
      };
    }

    if (pathname.startsWith(ProtectedPaths.HOME_NOTES)) {
      return {
        eyebrow: "Notas",
        title: "Tus ideas",
        lead: "Notas rápidas, listas y etiquetas, a mano.",
      };
    }

    if (pathname.startsWith(ProtectedPaths.HOME_PROFILE)) {
      if (isAdmin) {
        return {
          eyebrow: "Admin",
          title: "Tu cuenta y el equipo",
          lead: "Cambia tus datos o revisa quién tiene acceso.",
        };
      }

      return {
        eyebrow: "Perfil",
        title: "Tu cuenta",
        lead: "Nombre, correo y contraseña, cuando quieras cambiarlos.",
      };
    }

    return {
      eyebrow: "Beacon",
      title: greeting,
      lead: "Elige por dónde seguir hoy.",
    };
  }, [pathname, firstName, isAdmin]);

  return (
    <>
      <AppAlert type="success" message="Sesión cerrada." show={showAlert} />
      <div className="auth-shell-page">
        <Navbar />

        <main className="auth-shell-main">
          <section className="auth-shell-hero home-auth-hero" aria-label={hero.title}>
            <div className="auth-shell-container home-auth-hero-content">
              <div className="home-auth-hero-copy">
                <p className="home-auth-hero-eyebrow">{hero.eyebrow}</p>
                <h1>{hero.title}</h1>
                <p className="home-auth-hero-lead">{hero.lead}</p>
              </div>

              <AppButton
                variant="danger"
                className="home-logout-button"
                onClick={logoutWithAlert}
                aria-label="Cerrar sesión"
              >
                <MdLogout size={20} />
                <span className="home-logout-label">Cerrar sesión</span>
              </AppButton>
            </div>
          </section>

          <section className="home-auth-section">
            <div className="auth-shell-container">
              <div className="home-auth-card">
                <Outlet />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default HomeWindow;
