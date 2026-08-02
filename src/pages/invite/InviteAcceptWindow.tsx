import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppAlert, Navbar } from "../../commons/components";
import { hasAccessToken } from "../../services/auth/session";
import { acceptCalendarInvite } from "../../services/calendars/calendars.service";
import { acceptSpaceInvite } from "../../services/finance/finance.service";
import { HomeRouteConfig } from "../../commons/utils/protectedPaths";
import "./inviteAcceptWindow.css";

type InviteKind = "calendar" | "finance";

const isInviteKind = (value: string | undefined): value is InviteKind =>
  value === "calendar" || value === "finance";

function InviteAcceptWindow() {
  const { kind, token } = useParams<{ kind: string; token: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Aceptando invitación…");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isInviteKind(kind) || !token?.trim()) {
        setError("Enlace de invitación inválido.");
        setShowError(true);
        setMessage("No se pudo aceptar la invitación.");
        return;
      }

      if (!hasAccessToken()) {
        navigate(`/login?next=${encodeURIComponent(`/invite/${kind}/${token}`)}`, {
          replace: true,
        });
        return;
      }

      const result =
        kind === "calendar"
          ? await acceptCalendarInvite(token)
          : await acceptSpaceInvite(token);

      if (cancelled) return;

      if (!result.success) {
        setError(result.error || "No se pudo aceptar la invitación.");
        setShowError(true);
        setMessage("No se pudo aceptar la invitación.");
        return;
      }

      setMessage("Invitación aceptada. Redirigiendo…");
      navigate(
        kind === "calendar"
          ? HomeRouteConfig.TASKS.navigatePath
          : HomeRouteConfig.FINANCE.navigatePath,
        { replace: true },
      );
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [kind, token, navigate]);

  return (
    <div className="invite-accept-page">
      <Navbar />
      <AppAlert type="error" message={error} show={showError} />
      <main className="invite-accept-main">
        <p>{message}</p>
      </main>
    </div>
  );
}

export default InviteAcceptWindow;
