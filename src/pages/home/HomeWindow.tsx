import "./homeWindow.css";
import { Outlet } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { handleLogout } from "../../commons/utils/HandleLogout";
import { AppAlert, AppButton,Navbar } from '../../commons/components';
import { useState } from "react";

/**
 * Layout principal para rutas autenticadas de home.
 *
 * Renderiza la barra superior, contenedor común, outlet de subrutas y acción de
 * cierre de sesión.
 */
function HomeWindow() {
  const [showAlert, setShowAlert] = useState(false);

  const logoutWithAlert = () => {
    setShowAlert(true);
    handleLogout();
  };

  return (
    <>
      <AppAlert type="success" message="Sesión cerrada." show={showAlert} />
      <div className="home-auth-page">
        <Navbar />

        <main className="home-auth-main">
          <section className="home-auth-hero">
            <div className="home-auth-container home-auth-hero-content">
              <div>
                <h1>Panel principal</h1>
                <p>Acceda a las funciones del sistema según su perfil institucional</p>
              </div>

              <AppButton variant="danger" className="home-logout-button" onClick={logoutWithAlert}>
                <MdLogout size={22} />
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
