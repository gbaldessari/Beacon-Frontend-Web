import "./homeWindow.css";
import { Outlet } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { handleLogout } from "../../commons/utils/HandleLogout";
import { AppAlert, AppButton, Navbar } from "../../commons/components";
import { useState } from "react";
import { useAuthProfile } from "../../services/auth/useAuthProfile";

/**
 * Layout principal para rutas autenticadas de home.
 *
 * Renderiza la barra superior, contenedor común, outlet de subrutas y acción de
 * cierre de sesión.
 */
function HomeWindow() {
  const [showAlert, setShowAlert] = useState(false);
  const { firstName } = useAuthProfile();

  const logoutWithAlert = () => {
    setShowAlert(true);
    handleLogout();
  };

  const greetingName = firstName?.trim();
  const heroTitle = greetingName ? `Hola, ${greetingName}` : "Hola de nuevo";

  return (
    <>
      <AppAlert type="success" message="Sesión cerrada." show={showAlert} />
      <div className="home-auth-page">
        <Navbar />

        <main className="home-auth-main">
          <section className="home-auth-hero">
            <div className="home-auth-container home-auth-hero-content">
              <div className="home-auth-hero-copy">
                <p className="home-auth-hero-eyebrow">Tu faro personal</p>
                <h1>{heroTitle}</h1>
                <p>
                  Mantén el rumbo: finanzas, hábitos, tareas y recordatorios en un
                  solo lugar claro y ordenado.
                </p>
              </div>

              <AppButton variant="danger" className="home-logout-button" onClick={logoutWithAlert}>
                <MdLogout size={20} />
                Cerrar sesión
              </AppButton>
            </div>
          </section>

          <section className="home-auth-section">
            <div className="home-auth-container">
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
