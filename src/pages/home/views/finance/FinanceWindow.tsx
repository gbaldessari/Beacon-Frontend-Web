import { useEffect, useMemo, useState } from "react";
import { useFinanceRealtime } from "../../../../services/realtime/useRealtime";
import {
  MdAdd,
  MdDeleteOutline,
  MdEdit,
  MdPayments,
} from "react-icons/md";
import {
  AppAlert,
  AppButton,
  AppInput,
  AppModal,
  AppSelect,
  AppTextarea,
  ListSkeleton,
  PageSkeleton,
} from "../../../../commons/components";
import {
  acceptSpaceInvite,
  contributeGoal,
  createBudget,
  createCategory,
  createFromReminder,
  createGoal,
  createHouseholdSpace,
  createSpaceInvite,
  createTag,
  createTransaction,
  deleteBudget,
  deleteCategory,
  deleteGoal,
  deleteTag,
  deleteTransaction,
  getFinanceSummary,
  listBudgetStatus,
  listCategories,
  listFinanceSpaces,
  listGoals,
  listPendingInvites,
  listSpaceInvites,
  listSpaceMembers,
  listTags,
  listTransactions,
  removeMember,
  revokeSpaceInvite,
  updateTransaction,
} from "../../../../services/finance/finance.service";
import type {
  FinanceBudgetStatus,
  FinanceCategory,
  FinanceGoal,
  FinanceInvite,
  FinanceMember,
  FinanceSpace,
  FinanceSummary,
  FinanceTag,
  FinanceTransaction,
  FinanceTransactionType,
} from "../../../../services/finance/types/Finance.type";
import { listReminders } from "../../../../services/reminders/reminders.service";
import type { Reminder } from "../../../../services/reminders/types/Reminder.type";
import "../homeViewChrome.css";
import "./financeWindow.css";

type TabId = "movements" | "budgets" | "goals" | "taxonomy" | "members";

function monthBounds(year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function flattenCategories(tree: FinanceCategory[]) {
  const options: Array<{ id: string; label: string; kind: string }> = [];
  for (const root of tree) {
    if (root.children?.length) {
      for (const child of root.children) {
        options.push({
          id: child.id,
          label: `${root.name} › ${child.name}`,
          kind: child.kind,
        });
      }
    } else {
      options.push({ id: root.id, label: root.name, kind: root.kind });
    }
  }
  return options;
}

function FinanceWindow() {
  const now = new Date();
  const [tab, setTab] = useState<TabId>("movements");
  const [spaces, setSpaces] = useState<FinanceSpace[]>([]);
  const [spaceId, setSpaceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [tags, setTags] = useState<FinanceTag[]>([]);
  const [budgets, setBudgets] = useState<FinanceBudgetStatus[]>([]);
  const [goals, setGoals] = useState<FinanceGoal[]>([]);
  const [members, setMembers] = useState<FinanceMember[]>([]);
  const [invites, setInvites] = useState<FinanceInvite[]>([]);
  const [pendingInvites, setPendingInvites] = useState<FinanceInvite[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [filterType, setFilterType] = useState<"" | FinanceTransactionType>("");
  const [filterTagId, setFilterTagId] = useState("");

  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<FinanceTransaction | null>(null);
  const [txnType, setTxnType] = useState<FinanceTransactionType>("expense");
  const [txnAmount, setTxnAmount] = useState("");
  const [txnDate, setTxnDate] = useState(now.toISOString().slice(0, 10));
  const [txnCategoryId, setTxnCategoryId] = useState("");
  const [txnNote, setTxnNote] = useState("");
  const [txnTagIds, setTxnTagIds] = useState<string[]>([]);
  const [txnReminderId, setTxnReminderId] = useState("");
  const [saving, setSaving] = useState(false);

  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetTarget, setBudgetTarget] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [contributeAmounts, setContributeAmounts] = useState<Record<string, string>>({});
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payReminderId, setPayReminderId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payCategoryId, setPayCategoryId] = useState("");

  const currentSpace = spaces.find((s) => s.id === spaceId) ?? null;
  const canEdit =
    currentSpace?.role === "owner" || currentSpace?.role === "editor";
  const isOwner = currentSpace?.role === "owner";
  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );

  const flashError = (message: string) => {
    setError(message);
    setShowError(true);
    window.setTimeout(() => setShowError(false), 2800);
  };

  const flashSuccess = (message: string) => {
    setSuccess(message);
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 2200);
  };

  const loadSpaces = async () => {
    const [spacesRes, pendingRes] = await Promise.all([
      listFinanceSpaces(),
      listPendingInvites(),
    ]);
    if (!spacesRes.success || !spacesRes.data) {
      flashError(spacesRes.error || "No se pudieron cargar los espacios.");
      return [];
    }
    setSpaces(spacesRes.data);
    if (pendingRes.success && pendingRes.data) {
      setPendingInvites(pendingRes.data);
    }
    return spacesRes.data;
  };

  const loadSpaceData = async (id: string) => {
    if (!id) return;
    setLoading(true);
    const { from, to } = monthBounds(year, month);
    const [
      summaryRes,
      txnRes,
      catRes,
      tagRes,
      budgetRes,
      goalRes,
      membersRes,
      remindersRes,
    ] = await Promise.all([
      getFinanceSummary(id, from, to),
      listTransactions(id, {
        from,
        to,
        type: filterType || undefined,
        tagId: filterTagId || undefined,
      }),
      listCategories(id),
      listTags(id),
      listBudgetStatus(id, year, month),
      listGoals(id),
      listSpaceMembers(id),
      listReminders(),
    ]);

    if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
    if (txnRes.success && txnRes.data) setTransactions(txnRes.data.items);
    if (catRes.success && catRes.data) setCategories(catRes.data);
    if (tagRes.success && tagRes.data) setTags(tagRes.data);
    if (budgetRes.success && budgetRes.data) setBudgets(budgetRes.data);
    if (goalRes.success && goalRes.data) setGoals(goalRes.data);
    if (membersRes.success && membersRes.data) setMembers(membersRes.data);
    if (remindersRes.success && remindersRes.data) {
      setReminders(remindersRes.data);
    }

    const spaceMeta = spaces.find((s) => s.id === id);
    if (spaceMeta?.role === "owner") {
      const invitesRes = await listSpaceInvites(id);
      if (invitesRes.success && invitesRes.data) setInvites(invitesRes.data);
      else setInvites([]);
    } else {
      setInvites([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await loadSpaces();
      if (cancelled || !list.length) {
        setLoading(false);
        return;
      }
      const initial = list[0].id;
      setSpaceId(initial);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (spaceId) {
      void loadSpaceData(spaceId);
    }
  }, [spaceId, year, month, filterType, filterTagId]);

  useFinanceRealtime(
    spaceId || null,
    () => {
      if (spaceId) {
        void loadSpaceData(spaceId);
      }
    },
    () => {
      void loadSpaces().then((list) => {
        if (!list.length) {
          setSpaceId("");
          return;
        }
        if (!list.some((s) => s.id === spaceId)) {
          setSpaceId(list[0].id);
        }
      });
    },
  );

  const openCreateTxn = () => {
    setEditingTxn(null);
    setTxnType("expense");
    setTxnAmount("");
    setTxnDate(new Date().toISOString().slice(0, 10));
    setTxnCategoryId(categoryOptions[0]?.id ?? "");
    setTxnNote("");
    setTxnTagIds([]);
    setTxnReminderId("");
    setTxnModalOpen(true);
  };

  const openEditTxn = (txn: FinanceTransaction) => {
    setEditingTxn(txn);
    setTxnType(txn.type);
    setTxnAmount(String(txn.amount));
    setTxnDate(txn.occurredAt.slice(0, 10));
    setTxnCategoryId(txn.categoryId);
    setTxnNote(txn.note ?? "");
    setTxnTagIds(txn.tagIds);
    setTxnReminderId(txn.reminderId ?? "");
    setTxnModalOpen(true);
  };

  const saveTransaction = async () => {
    const amount = Number(txnAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      flashError("Ingresa un monto válido.");
      return;
    }
    if (!txnCategoryId) {
      flashError("Selecciona una categoría.");
      return;
    }
    setSaving(true);
    const payload = {
      type: txnType,
      amount,
      occurredAt: txnDate,
      categoryId: txnCategoryId,
      note: txnNote.trim() || undefined,
      tagIds: txnTagIds,
      reminderId: txnReminderId || undefined,
    };
    const res = editingTxn
      ? await updateTransaction(spaceId, editingTxn.id, payload)
      : await createTransaction(spaceId, payload);
    setSaving(false);
    if (!res.success) {
      flashError(res.error || "No se pudo guardar el movimiento.");
      return;
    }
    setTxnModalOpen(false);
    flashSuccess(editingTxn ? "Movimiento actualizado." : "Movimiento creado.");
    await loadSpaceData(spaceId);
  };

  const handleDeleteTxn = async (txnId: string) => {
    if (!window.confirm("¿Eliminar este movimiento?")) return;
    const res = await deleteTransaction(spaceId, txnId);
    if (!res.success) {
      flashError(res.error || "No se pudo eliminar.");
      return;
    }
    flashSuccess("Movimiento eliminado.");
    await loadSpaceData(spaceId);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const res = await createTag(spaceId, newTagName.trim());
    if (!res.success) {
      flashError(res.error || "No se pudo crear la etiqueta.");
      return;
    }
    setNewTagName("");
    flashSuccess("Etiqueta creada.");
    await loadSpaceData(spaceId);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const res = await createCategory(spaceId, {
      name: newCategoryName.trim(),
      parentId: newCategoryParentId || undefined,
      kind: "any",
    });
    if (!res.success) {
      flashError(res.error || "No se pudo crear la categoría.");
      return;
    }
    setNewCategoryName("");
    setNewCategoryParentId("");
    flashSuccess("Categoría creada.");
    await loadSpaceData(spaceId);
  };

  const handleCreateBudget = async () => {
    const amount = Number(budgetAmount);
    if (!Number.isFinite(amount) || amount <= 0 || !budgetTarget) {
      flashError("Completa monto y objetivo del presupuesto.");
      return;
    }
    const [kind, id] = budgetTarget.split(":");
    const res = await createBudget(spaceId, {
      year,
      month,
      amount,
      categoryId: kind === "category" ? id : undefined,
      tagId: kind === "tag" ? id : undefined,
    });
    if (!res.success) {
      flashError(res.error || "No se pudo crear el presupuesto.");
      return;
    }
    setBudgetAmount("");
    setBudgetTarget("");
    flashSuccess("Presupuesto creado.");
    await loadSpaceData(spaceId);
  };

  const handleCreateGoal = async () => {
    const target = Number(goalTarget);
    if (!goalName.trim() || !Number.isFinite(target) || target <= 0) {
      flashError("Nombre y monto objetivo son obligatorios.");
      return;
    }
    const res = await createGoal(spaceId, {
      name: goalName.trim(),
      targetAmount: target,
      deadline: goalDeadline || undefined,
    });
    if (!res.success) {
      flashError(res.error || "No se pudo crear la meta.");
      return;
    }
    setGoalName("");
    setGoalTarget("");
    setGoalDeadline("");
    flashSuccess("Meta creada.");
    await loadSpaceData(spaceId);
  };

  const handleContribute = async (goalId: string) => {
    const amount = Number(contributeAmounts[goalId] || "");
    if (!Number.isFinite(amount) || amount <= 0) {
      flashError("Ingresa un aporte válido.");
      return;
    }
    const res = await contributeGoal(spaceId, goalId, amount);
    if (!res.success) {
      flashError(res.error || "No se pudo registrar el aporte.");
      return;
    }
    setContributeAmounts((prev) => ({ ...prev, [goalId]: "" }));
    flashSuccess("Aporte registrado.");
    await loadSpaceData(spaceId);
  };

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) return;
    const res = await createHouseholdSpace(householdName.trim());
    if (!res.success || !res.data) {
      flashError(res.error || "No se pudo crear el hogar.");
      return;
    }
    setHouseholdName("");
    flashSuccess("Hogar creado.");
    const list = await loadSpaces();
    setSpaceId(res.data.id);
    if (!list.find((s) => s.id === res.data!.id)) {
      setSpaces((prev) => [...prev, res.data!]);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    const res = await createSpaceInvite(spaceId, inviteEmail.trim(), inviteRole);
    if (!res.success) {
      flashError(res.error || "No se pudo enviar la invitación.");
      return;
    }
    setInviteEmail("");
    flashSuccess("Invitación enviada por correo. El token queda como respaldo.");
    await loadSpaceData(spaceId);
  };

  const handleAcceptInvite = async (token: string) => {
    const res = await acceptSpaceInvite(token);
    if (!res.success || !res.data) {
      flashError(res.error || "No se pudo aceptar la invitación.");
      return;
    }
    flashSuccess(`Te uniste a ${res.data.name}.`);
    const list = await loadSpaces();
    setSpaceId(res.data.id);
    if (!list.find((s) => s.id === res.data!.id)) {
      setSpaces((prev) => [...prev, res.data!]);
    }
  };

  const handleRegisterPayment = async () => {
    const amount = Number(payAmount);
    if (!payReminderId || !Number.isFinite(amount) || amount <= 0) {
      flashError("Selecciona un recordatorio y un monto.");
      return;
    }
    const res = await createFromReminder(spaceId, payReminderId, {
      amount,
      categoryId: payCategoryId || undefined,
    });
    if (!res.success) {
      flashError(res.error || "No se pudo registrar el pago.");
      return;
    }
    setPayModalOpen(false);
    flashSuccess("Pago registrado desde el recordatorio.");
    setTab("movements");
    await loadSpaceData(spaceId);
  };

  const toggleTag = (tagId: string) => {
    setTxnTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <div className="finance-window">
      <AppAlert type="error" message={error} show={showError} />
      <AppAlert type="success" message={success} show={showSuccess} />

      {canEdit && (
        <div className="finance-window-header">
          <div className="finance-window-header-actions">
            <AppButton
              variant="secondary"
              onClick={() => {
                setPayReminderId("");
                setPayAmount("");
                setPayCategoryId(categoryOptions[0]?.id ?? "");
                setPayModalOpen(true);
              }}
            >
              <MdPayments size={18} />
              Registrar pago
            </AppButton>
            <AppButton onClick={openCreateTxn}>
              <MdAdd size={20} />
              Nuevo movimiento
            </AppButton>
          </div>
        </div>
      )}

      {pendingInvites.length > 0 && (
        <div className="finance-pending-invites">
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="finance-pending-invite">
              <span>
                Invitación a <strong>{invite.spaceName}</strong> como {invite.role}
              </span>
              <AppButton
                variant="secondary"
                onClick={() => void handleAcceptInvite(invite.token)}
              >
                Aceptar
              </AppButton>
            </div>
          ))}
        </div>
      )}

      {loading && !summary ? (
        <PageSkeleton variant="finance" />
      ) : (
        <>
      <div className="finance-toolbar">
        <AppSelect
          value={spaceId}
          onChange={(e) => setSpaceId(e.target.value)}
          aria-label="Espacio"
        >
          {spaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.name} ({space.type === "personal" ? "personal" : "hogar"})
            </option>
          ))}
        </AppSelect>
        <AppSelect
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          aria-label="Mes"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(2000, m - 1, 1).toLocaleString("es", { month: "long" })}
            </option>
          ))}
        </AppSelect>
        <AppInput
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Año"
        />
      </div>

      <div className="finance-summary">
        <div className="finance-summary-card income">
          <span>Ingresos</span>
          <strong>{formatMoney(summary?.totalIncome ?? 0)}</strong>
        </div>
        <div className="finance-summary-card expense">
          <span>Gastos</span>
          <strong>{formatMoney(summary?.totalExpense ?? 0)}</strong>
        </div>
        <div className="finance-summary-card balance">
          <span>Balance</span>
          <strong>{formatMoney(summary?.balance ?? 0)}</strong>
        </div>
      </div>

      <div className="home-view-tabs finance-tabs" role="tablist" aria-label="Secciones de finanzas">
        {(
          [
            ["movements", "Movimientos", "Movs"],
            ["budgets", "Presupuestos", "Presup."],
            ["goals", "Metas", "Metas"],
            ["taxonomy", "Categorías y tags", "Categorías"],
            ["members", "Miembros", "Equipo"],
          ] as Array<[TabId, string, string]>
        ).map(([id, label, shortLabel]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`home-view-tab finance-tab ${tab === id ? "is-active" : ""}`}
            onClick={() => setTab(id)}
          >
            <span className="finance-tab-full">{label}</span>
            <span className="finance-tab-short">{shortLabel}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : tab === "movements" ? (
        <section className="finance-section">
          <div className="finance-filters">
            <AppSelect
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "" | FinanceTransactionType)
              }
            >
              <option value="">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </AppSelect>
            <AppSelect
              value={filterTagId}
              onChange={(e) => setFilterTagId(e.target.value)}
            >
              <option value="">Todas las etiquetas</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </AppSelect>
          </div>
          {transactions.length === 0 ? (
            <p className="finance-empty">Sin movimientos en este período.</p>
          ) : (
            <ul className="finance-list">
              {transactions.map((txn) => (
                <li key={txn.id} className={`finance-item is-${txn.type}`}>
                  <div>
                    <strong>
                      {txn.type === "income" ? "+" : "−"}
                      {formatMoney(txn.amount)}
                    </strong>
                    <p>
                      {txn.categoryName}
                      {txn.note ? ` · ${txn.note}` : ""}
                    </p>
                    <div className="finance-item-meta">
                      <span>{txn.occurredAt.slice(0, 10)}</span>
                      {txn.tags.map((tag) => (
                        <span key={tag.id} className="finance-chip">
                          {tag.name}
                        </span>
                      ))}
                      {txn.reminderId && (
                        <span className="finance-chip">vinculado a tarea</span>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="finance-item-actions">
                      <button
                        type="button"
                        aria-label="Editar movimiento"
                        onClick={() => openEditTxn(txn)}
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label="Eliminar movimiento"
                        onClick={() => void handleDeleteTxn(txn.id)}
                      >
                        <MdDeleteOutline size={18} />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : tab === "budgets" ? (
        <section className="finance-section">
          {canEdit && (
            <div className="finance-inline-form">
              <AppSelect
                value={budgetTarget}
                onChange={(e) => setBudgetTarget(e.target.value)}
              >
                <option value="">Objetivo…</option>
                <optgroup label="Categorías">
                  {categoryOptions.map((opt) => (
                    <option key={opt.id} value={`category:${opt.id}`}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Etiquetas">
                  {tags.map((tag) => (
                    <option key={tag.id} value={`tag:${tag.id}`}>
                      {tag.name}
                    </option>
                  ))}
                </optgroup>
              </AppSelect>
              <AppInput
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Tope"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
              <AppButton onClick={() => void handleCreateBudget()}>
                Añadir
              </AppButton>
            </div>
          )}
          {budgets.length === 0 ? (
            <p className="finance-empty">Sin presupuestos este mes.</p>
          ) : (
            <ul className="finance-list">
              {budgets.map((budget) => (
                <li key={budget.id} className="finance-budget-item">
                  <div className="finance-budget-head">
                    <strong>{budget.label}</strong>
                    <span>
                      {formatMoney(budget.spent)} / {formatMoney(budget.amount)}
                    </span>
                  </div>
                  <div className="finance-progress">
                    <div
                      className={`finance-progress-bar ${budget.overBudget ? "is-over" : ""}`}
                      style={{ width: `${Math.min(100, budget.percent)}%` }}
                    />
                  </div>
                  <div className="finance-budget-foot">
                    <span>
                      {budget.overBudget
                        ? `Excedido ${formatMoney(Math.abs(budget.remaining))}`
                        : `Quedan ${formatMoney(budget.remaining)}`}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => void deleteBudget(spaceId, budget.id).then(() => loadSpaceData(spaceId))}
                      >
                        <MdDeleteOutline size={18} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : tab === "goals" ? (
        <section className="finance-section">
          {canEdit && (
            <div className="finance-inline-form">
              <AppInput
                placeholder="Nombre de la meta"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
              <AppInput
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Objetivo"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
              />
              <AppInput
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
              />
              <AppButton onClick={() => void handleCreateGoal()}>Crear</AppButton>
            </div>
          )}
          {goals.length === 0 ? (
            <p className="finance-empty">Sin metas de ahorro.</p>
          ) : (
            <ul className="finance-list">
              {goals.map((goal) => (
                <li key={goal.id} className="finance-budget-item">
                  <div className="finance-budget-head">
                    <strong>{goal.name}</strong>
                    <span>
                      {formatMoney(goal.currentAmount)} /{" "}
                      {formatMoney(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="finance-progress">
                    <div
                      className="finance-progress-bar is-goal"
                      style={{ width: `${goal.percent}%` }}
                    />
                  </div>
                  <div className="finance-budget-foot">
                    <span>
                      {goal.status}
                      {goal.deadline ? ` · hasta ${goal.deadline}` : ""}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          void deleteGoal(spaceId, goal.id).then(() =>
                            loadSpaceData(spaceId),
                          )
                        }
                      >
                        <MdDeleteOutline size={18} />
                      </button>
                    )}
                  </div>
                  {canEdit && goal.status === "active" && (
                    <div className="finance-inline-form compact">
                      <AppInput
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Aporte"
                        value={contributeAmounts[goal.id] ?? ""}
                        onChange={(e) =>
                          setContributeAmounts((prev) => ({
                            ...prev,
                            [goal.id]: e.target.value,
                          }))
                        }
                      />
                      <AppButton
                        variant="secondary"
                        onClick={() => void handleContribute(goal.id)}
                      >
                        Aportar
                      </AppButton>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : tab === "taxonomy" ? (
        <section className="finance-section finance-taxonomy">
          <div>
            <h3>Categorías</h3>
            {canEdit && (
              <div className="finance-inline-form">
                <AppInput
                  placeholder="Nueva categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <AppSelect
                  value={newCategoryParentId}
                  onChange={(e) => setNewCategoryParentId(e.target.value)}
                >
                  <option value="">Sin padre (raíz)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </AppSelect>
                <AppButton onClick={() => void handleCreateCategory()}>
                  Añadir
                </AppButton>
              </div>
            )}
            <ul className="finance-list">
              {categories.map((cat) => (
                <li key={cat.id} className="finance-item">
                  <div>
                    <strong>{cat.name}</strong>
                    <p>{cat.kind}</p>
                    {cat.children?.map((child) => (
                      <div key={child.id} className="finance-child-cat">
                        <span>
                          {child.name} · {child.kind}
                        </span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() =>
                              void deleteCategory(spaceId, child.id).then(() =>
                                loadSpaceData(spaceId),
                              )
                            }
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        void deleteCategory(spaceId, cat.id).then(() =>
                          loadSpaceData(spaceId),
                        )
                      }
                    >
                      <MdDeleteOutline size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Etiquetas</h3>
            {canEdit && (
              <div className="finance-inline-form">
                <AppInput
                  placeholder="Nueva etiqueta"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <AppButton onClick={() => void handleCreateTag()}>Añadir</AppButton>
              </div>
            )}
            <ul className="finance-list">
              {tags.map((tag) => (
                <li key={tag.id} className="finance-item">
                  <strong>{tag.name}</strong>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        void deleteTag(spaceId, tag.id).then(() =>
                          loadSpaceData(spaceId),
                        )
                      }
                    >
                      <MdDeleteOutline size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="finance-section">
          <div className="finance-inline-form">
            <AppInput
              placeholder="Nombre del hogar"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
            />
            <AppButton onClick={() => void handleCreateHousehold()}>
              Crear hogar
            </AppButton>
          </div>

          {isOwner && currentSpace?.type === "household" && (
            <div className="finance-inline-form">
              <AppInput
                type="email"
                placeholder="Email a invitar"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <AppSelect
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </AppSelect>
              <AppButton onClick={() => void handleInvite()}>Invitar</AppButton>
            </div>
          )}

          <h3>Miembros</h3>
          <ul className="finance-list">
            {members.map((member) => (
              <li key={member.id} className="finance-item">
                <div>
                  <strong>
                    {member.firstName} {member.lastName}
                  </strong>
                  <p>
                    {member.email} · {member.role}
                  </p>
                </div>
                {isOwner && member.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() =>
                      void removeMember(spaceId, member.userId).then(() =>
                        loadSpaceData(spaceId),
                      )
                    }
                  >
                    <MdDeleteOutline size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isOwner && invites.length > 0 && (
            <>
              <h3>Invitaciones</h3>
              <ul className="finance-list">
                {invites.map((invite) => (
                  <li key={invite.id} className="finance-item">
                    <div>
                      <strong>{invite.email}</strong>
                      <p>
                        {invite.role} · {invite.status}
                      </p>
                      {invite.status === "pending" && (
                        <code className="finance-token">{invite.token}</code>
                      )}
                    </div>
                    {invite.status === "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          void revokeSpaceInvite(spaceId, invite.id).then(() =>
                            loadSpaceData(spaceId),
                          )
                        }
                      >
                        <MdDeleteOutline size={18} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
        </>
      )}

      {canEdit && (
        <button
          type="button"
          className="home-view-fab finance-window-fab"
          aria-label="Nuevo movimiento"
          onClick={openCreateTxn}
        >
          <MdAdd size={28} />
        </button>
      )}

      <AppModal
        open={txnModalOpen}
        onClose={() => setTxnModalOpen(false)}
        title={editingTxn ? "Editar movimiento" : "Nuevo movimiento"}
      >
        <div className="finance-modal-form">
          <AppSelect
            value={txnType}
            onChange={(e) => setTxnType(e.target.value as FinanceTransactionType)}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </AppSelect>
          <AppInput
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Monto"
            value={txnAmount}
            onChange={(e) => setTxnAmount(e.target.value)}
          />
          <AppInput
            type="date"
            value={txnDate}
            onChange={(e) => setTxnDate(e.target.value)}
          />
          <AppSelect
            value={txnCategoryId}
            onChange={(e) => setTxnCategoryId(e.target.value)}
          >
            <option value="">Categoría…</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </AppSelect>
          <AppTextarea
            placeholder="Nota (opcional)"
            value={txnNote}
            onChange={(e) => setTxnNote(e.target.value)}
          />
          <div className="finance-tag-picker">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`finance-chip-btn ${txnTagIds.includes(tag.id) ? "is-active" : ""}`}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <AppSelect
            value={txnReminderId}
            onChange={(e) => setTxnReminderId(e.target.value)}
          >
            <option value="">Sin recordatorio vinculado</option>
            {reminders.map((reminder) => (
              <option key={reminder.id} value={reminder.id}>
                {reminder.title}
              </option>
            ))}
          </AppSelect>
          <div className="finance-modal-actions">
            <AppButton variant="ghost" onClick={() => setTxnModalOpen(false)}>
              Cancelar
            </AppButton>
            <AppButton isLoading={saving} onClick={() => void saveTransaction()}>
              Guardar
            </AppButton>
          </div>
        </div>
      </AppModal>

      <AppModal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Registrar pago desde recordatorio"
      >
        <div className="finance-modal-form">
          <AppSelect
            value={payReminderId}
            onChange={(e) => setPayReminderId(e.target.value)}
          >
            <option value="">Recordatorio…</option>
            {reminders.map((reminder) => (
              <option key={reminder.id} value={reminder.id}>
                {reminder.title}
              </option>
            ))}
          </AppSelect>
          <AppInput
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Monto"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
          <AppSelect
            value={payCategoryId}
            onChange={(e) => setPayCategoryId(e.target.value)}
          >
            <option value="">Categoría (auto si vacío)</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </AppSelect>
          <div className="finance-modal-actions">
            <AppButton variant="ghost" onClick={() => setPayModalOpen(false)}>
              Cancelar
            </AppButton>
            <AppButton onClick={() => void handleRegisterPayment()}>
              Registrar
            </AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  );
}

export default FinanceWindow;
