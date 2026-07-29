/**
 * Punto de entrada principal de la aplicación React.
 *
 * @remarks
 * - Usa React.StrictMode para detectar problemas potenciales en la aplicación.
 * - Envuelve la aplicación en BrowserRouter para habilitar el enrutamiento con React Router.
 * - Importa los estilos globales desde index.css.
 * - Renderiza el componente principal <App /> en el elemento con id 'root'.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

// Renderiza la aplicación React en el DOM dentro del elemento con id 'root'
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);