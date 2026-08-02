import { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdArchive,
  MdCheckBox,
  MdDelete,
  MdNotes,
  MdPushPin,
  MdUnarchive,
} from "react-icons/md";
import { AppAlert, AppButton, PageSkeleton } from "../../../../commons/components";
import {
  createNote,
  createNoteLabel,
  deleteNote,
  deleteNoteLabel,
  listNoteLabels,
  listNotes,
  updateNote,
} from "../../../../services/notes/notes.service";
import type { Note, NoteLabel } from "../../../../services/notes/types/Note.type";
import "../homeViewChrome.css";
import "./notesWindow.css";

const NOTE_COLORS = [
  "#fff9c4",
  "#c8e6c9",
  "#bbdefb",
  "#f8bbd0",
  "#ffe0b2",
  "#e1bee7",
  "#ffffff",
];

type ComposerMode = "text" | "checklist";

function NotesWindow() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<NoteLabel[]>([]);
  const [archivedView, setArchivedView] = useState(false);
  const [labelFilter, setLabelFilter] = useState<string>("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<ComposerMode>("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [checklistDraft, setChecklistDraft] = useState("");
  const [checklistItems, setChecklistItems] = useState<
    Array<{ text: string; done: boolean }>
  >([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const flashError = (message: string) => {
    setError(message);
    setShowError(true);
    window.setTimeout(() => setShowError(false), 2400);
  };

  const flashSuccess = (message: string) => {
    setSuccess(message);
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 1800);
  };

  const load = async () => {
    setLoading(true);
    const [notesRes, labelsRes] = await Promise.all([
      listNotes({
        archived: archivedView,
        labelId: labelFilter || undefined,
        q: query.trim() || undefined,
      }),
      listNoteLabels(),
    ]);

    if (!notesRes.success) {
      flashError(notesRes.error || "No se pudieron cargar las notas.");
    } else {
      setNotes(notesRes.data ?? []);
    }

    if (labelsRes.success) {
      setLabels(labelsRes.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [archivedView, labelFilter]);

  const pinnedNotes = useMemo(() => notes.filter((n) => n.pinned), [notes]);
  const otherNotes = useMemo(() => notes.filter((n) => !n.pinned), [notes]);

  const resetComposer = () => {
    setComposerOpen(false);
    setComposerMode("text");
    setTitle("");
    setBody("");
    setColor(NOTE_COLORS[0]);
    setChecklistDraft("");
    setChecklistItems([]);
    setSelectedLabelIds([]);
    setEditingId(null);
  };

  const openEdit = (note: Note) => {
    setEditingId(note.id);
    setComposerOpen(true);
    setComposerMode(note.isChecklist ? "checklist" : "text");
    setTitle(note.title);
    setBody(note.body);
    setColor(note.color);
    setChecklistItems(
      note.checklistItems.map((item) => ({ text: item.text, done: item.done })),
    );
    setSelectedLabelIds(note.labels.map((l) => l.id));
  };

  const addChecklistItem = () => {
    const text = checklistDraft.trim();
    if (!text) return;
    setChecklistItems((prev) => [...prev, { text, done: false }]);
    setChecklistDraft("");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: title.trim(),
      body: composerMode === "text" ? body.trim() : "",
      color,
      isChecklist: composerMode === "checklist",
      checklistItems:
        composerMode === "checklist"
          ? checklistItems.map((item, index) => ({
              text: item.text,
              done: item.done,
              position: index,
            }))
          : undefined,
      labelIds: selectedLabelIds,
    };

    const res = editingId
      ? await updateNote(editingId, payload)
      : await createNote(payload);

    setSaving(false);
    if (!res.success) {
      flashError(res.error || "No se pudo guardar la nota.");
      return;
    }

    flashSuccess(editingId ? "Nota actualizada." : "Nota creada.");
    resetComposer();
    await load();
  };

  const handleTogglePin = async (note: Note) => {
    const res = await updateNote(note.id, { pinned: !note.pinned });
    if (!res.success) {
      flashError(res.error || "No se pudo actualizar.");
      return;
    }
    await load();
  };

  const handleToggleArchive = async (note: Note) => {
    const res = await updateNote(note.id, { archived: !note.archived });
    if (!res.success) {
      flashError(res.error || "No se pudo archivar.");
      return;
    }
    await load();
  };

  const handleDelete = async (note: Note) => {
    const res = await deleteNote(note.id);
    if (!res.success) {
      flashError(res.error || "No se pudo eliminar.");
      return;
    }
    flashSuccess("Nota eliminada.");
    if (editingId === note.id) resetComposer();
    await load();
  };

  const handleCreateLabel = async () => {
    const name = newLabelName.trim();
    if (!name) return;
    const res = await createNoteLabel({ name });
    if (!res.success || !res.data) {
      flashError(res.error || "No se pudo crear la etiqueta.");
      return;
    }
    setNewLabelName("");
    setLabels((prev) => [...prev, res.data!].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedLabelIds((prev) => [...prev, res.data!.id]);
  };

  const handleDeleteLabel = async (labelId: string) => {
    const res = await deleteNoteLabel(labelId);
    if (!res.success) {
      flashError(res.error || "No se pudo eliminar la etiqueta.");
      return;
    }
    setLabels((prev) => prev.filter((l) => l.id !== labelId));
    if (labelFilter === labelId) setLabelFilter("");
    setSelectedLabelIds((prev) => prev.filter((id) => id !== labelId));
    await load();
  };

  const renderNoteCard = (note: Note) => (
    <article
      key={note.id}
      className={`notes-card${note.pinned ? " is-pinned" : ""}`}
      style={{ background: note.color }}
    >
      <header className="notes-card-header">
        <button
          type="button"
          className="notes-card-title-btn"
          onClick={() => openEdit(note)}
        >
          <h3>{note.title || "Sin título"}</h3>
        </button>
        <button
          type="button"
          className={`notes-icon-btn${note.pinned ? " is-active" : ""}`}
          aria-label={note.pinned ? "Quitar pin" : "Fijar"}
          onClick={() => void handleTogglePin(note)}
        >
          <MdPushPin size={18} />
        </button>
      </header>

      <button type="button" className="notes-card-body-btn" onClick={() => openEdit(note)}>
        {note.isChecklist ? (
          <ul className="notes-card-checklist">
            {note.checklistItems.slice(0, 6).map((item) => (
              <li key={item.id} className={item.done ? "is-done" : ""}>
                {item.text}
              </li>
            ))}
          </ul>
        ) : (
          <p>{note.body || "—"}</p>
        )}
      </button>

      {note.labels.length > 0 && (
        <div className="notes-card-labels">
          {note.labels.map((label) => (
            <span key={label.id} style={{ borderColor: label.color }}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      <footer className="notes-card-actions">
        <button
          type="button"
          className="notes-icon-btn"
          aria-label={note.archived ? "Desarchivar" : "Archivar"}
          onClick={() => void handleToggleArchive(note)}
        >
          {note.archived ? <MdUnarchive size={18} /> : <MdArchive size={18} />}
        </button>
        <button
          type="button"
          className="notes-icon-btn"
          aria-label="Eliminar"
          onClick={() => void handleDelete(note)}
        >
          <MdDelete size={18} />
        </button>
      </footer>
    </article>
  );

  if (loading && notes.length === 0) {
    return <PageSkeleton variant="welcome" />;
  }

  return (
    <div className="notes-window">
      <AppAlert type="error" message={error} show={showError} />
      <AppAlert type="success" message={success} show={showSuccess} />

      <div className="notes-toolbar">
        <div className="home-view-tabs notes-view-tabs">
          <button
            type="button"
            className={`home-view-tab${!archivedView ? " is-active" : ""}`}
            onClick={() => setArchivedView(false)}
          >
            Activas
          </button>
          <button
            type="button"
            className={`home-view-tab${archivedView ? " is-active" : ""}`}
            onClick={() => setArchivedView(true)}
          >
            Archivadas
          </button>
        </div>

        <input
          className="notes-search"
          type="search"
          placeholder="Buscar notas…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void load();
          }}
        />

        <select
          className="notes-label-filter"
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value)}
          aria-label="Filtrar por etiqueta"
        >
          <option value="">Todas las etiquetas</option>
          {labels.map((label) => (
            <option key={label.id} value={label.id}>
              {label.name}
            </option>
          ))}
        </select>

        <AppButton
          type="button"
          onClick={() => {
            resetComposer();
            setComposerOpen(true);
          }}
        >
          <MdAdd size={18} /> Nueva nota
        </AppButton>
      </div>

      {composerOpen && (
        <section className="notes-composer" style={{ background: color }}>
          <div className="notes-composer-modes">
            <button
              type="button"
              className={composerMode === "text" ? "is-active" : ""}
              onClick={() => setComposerMode("text")}
            >
              <MdNotes size={18} /> Texto
            </button>
            <button
              type="button"
              className={composerMode === "checklist" ? "is-active" : ""}
              onClick={() => setComposerMode("checklist")}
            >
              <MdCheckBox size={18} /> Lista
            </button>
          </div>

          <input
            className="notes-composer-title"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {composerMode === "text" ? (
            <textarea
              className="notes-composer-body"
              placeholder="Toma una nota…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
            />
          ) : (
            <div className="notes-composer-checklist">
              <ul>
                {checklistItems.map((item, index) => (
                  <li key={`${item.text}-${index}`}>
                    <label>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() =>
                          setChecklistItems((prev) =>
                            prev.map((row, i) =>
                              i === index ? { ...row, done: !row.done } : row,
                            ),
                          )
                        }
                      />
                      <span className={item.done ? "is-done" : ""}>{item.text}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setChecklistItems((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div className="notes-composer-checklist-add">
                <input
                  value={checklistDraft}
                  placeholder="Nuevo ítem"
                  onChange={(e) => setChecklistDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChecklistItem();
                    }
                  }}
                />
                <button type="button" onClick={addChecklistItem}>
                  Añadir
                </button>
              </div>
            </div>
          )}

          <div className="notes-color-row" aria-label="Color">
            {NOTE_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className={`notes-color-swatch${color === swatch ? " is-active" : ""}`}
                style={{ background: swatch }}
                onClick={() => setColor(swatch)}
                aria-label={`Color ${swatch}`}
              />
            ))}
          </div>

          <div className="notes-labels-editor">
            <div className="notes-labels-chips">
              {labels.map((label) => {
                const active = selectedLabelIds.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    className={`notes-label-chip${active ? " is-active" : ""}`}
                    style={{ borderColor: label.color }}
                    onClick={() =>
                      setSelectedLabelIds((prev) =>
                        active
                          ? prev.filter((id) => id !== label.id)
                          : [...prev, label.id],
                      )
                    }
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
            <div className="notes-label-create">
              <input
                value={newLabelName}
                placeholder="Nueva etiqueta"
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleCreateLabel();
                  }
                }}
              />
              <button type="button" onClick={() => void handleCreateLabel()}>
                Crear
              </button>
            </div>
            {labels.length > 0 && (
              <div className="notes-label-manage">
                {labels.map((label) => (
                  <button
                    key={`del-${label.id}`}
                    type="button"
                    onClick={() => void handleDeleteLabel(label.id)}
                  >
                    Eliminar “{label.name}”
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="notes-composer-actions">
            <AppButton type="button" variant="secondary" onClick={resetComposer}>
              Cancelar
            </AppButton>
            <AppButton type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Guardando…" : editingId ? "Guardar" : "Crear"}
            </AppButton>
          </div>
        </section>
      )}

      {pinnedNotes.length > 0 && (
        <section className="notes-section">
          <h2>Fijadas</h2>
          <div className="notes-grid">{pinnedNotes.map(renderNoteCard)}</div>
        </section>
      )}

      <section className="notes-section">
        <h2>{archivedView ? "Archivadas" : pinnedNotes.length ? "Otras" : "Notas"}</h2>
        {otherNotes.length === 0 && pinnedNotes.length === 0 ? (
          <p className="notes-empty">
            {archivedView
              ? "No hay notas archivadas."
              : "Aún no tienes notas. Empieza con “Nueva nota”."}
          </p>
        ) : (
          <div className="notes-grid">{otherNotes.map(renderNoteCard)}</div>
        )}
      </section>

      <button
        type="button"
        className="home-view-fab"
        aria-label="Nueva nota"
        onClick={() => {
          resetComposer();
          setComposerOpen(true);
        }}
      >
        <MdAdd size={28} />
      </button>
    </div>
  );
}

export default NotesWindow;
