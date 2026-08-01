import { AppButton, AppModal } from "../../../../commons/components";
import type { ReminderEditScope } from "../../../../services/reminders/types/Reminder.type";
import "./recurrenceScopeDialog.css";

type RecurrenceScopeDialogProps = {
  open: boolean;
  mode: "edit" | "delete";
  allowInstanceScopes: boolean;
  onClose: () => void;
  onSelect: (scope: ReminderEditScope) => void;
};

const OPTIONS: {
  scope: ReminderEditScope;
  title: string;
  editHint: string;
  deleteHint: string;
  requiresInstance: boolean;
}[] = [
  {
    scope: "this",
    title: "Solo esta",
    editHint: "Cambia únicamente la fecha seleccionada.",
    deleteHint: "Elimina solo la fecha seleccionada.",
    requiresInstance: true,
  },
  {
    scope: "this_and_following",
    title: "Esta y futuras",
    editHint: "Parte la serie: lo anterior queda igual; desde hoy aplica lo nuevo.",
    deleteHint: "Cancela esta fecha y todas las siguientes.",
    requiresInstance: true,
  },
  {
    scope: "all",
    title: "Todas",
    editHint: "Actualiza toda la serie de recordatorios.",
    deleteHint: "Elimina toda la serie por completo.",
    requiresInstance: false,
  },
];

export function RecurrenceScopeDialog({
  open,
  mode,
  allowInstanceScopes,
  onClose,
  onSelect,
}: RecurrenceScopeDialogProps) {
  const visible = OPTIONS.filter(
    (option) => allowInstanceScopes || !option.requiresInstance,
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "¿Qué quieres editar?" : "¿Qué quieres eliminar?"}
      subtitle={
        allowInstanceScopes
          ? "Elige el alcance, como en un calendario."
          : "Desde la lista se aplica a toda la serie."
      }
      className="recurrence-scope-dialog"
    >
      <div className="recurrence-scope-list">
        {visible.map((option) => (
          <button
            key={option.scope}
            type="button"
            className="recurrence-scope-option"
            onClick={() => onSelect(option.scope)}
          >
            <strong>{option.title}</strong>
            <span>{mode === "edit" ? option.editHint : option.deleteHint}</span>
          </button>
        ))}
      </div>
      <div className="recurrence-scope-actions">
        <AppButton variant="ghost" onClick={onClose}>
          Cancelar
        </AppButton>
      </div>
    </AppModal>
  );
}
