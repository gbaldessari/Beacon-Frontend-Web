export type FinanceSpaceType = "personal" | "household";
export type FinanceMemberRole = "owner" | "editor" | "viewer";
export type FinanceInviteStatus = "pending" | "accepted" | "revoked" | "expired";
export type FinanceCategoryKind = "income" | "expense" | "any";
export type FinanceTransactionType = "income" | "expense";
export type FinanceGoalStatus = "active" | "completed" | "archived";

export type FinanceSpace = {
  id: string;
  name: string;
  type: FinanceSpaceType;
  role: FinanceMemberRole;
  createdAt: string;
};

export type FinanceMember = {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: FinanceMemberRole;
  createdAt: string;
};

export type FinanceInvite = {
  id: string;
  email: string;
  role: FinanceMemberRole;
  status: FinanceInviteStatus;
  token: string;
  expiresAt: string;
  createdAt: string;
  spaceId?: string;
  spaceName?: string;
};

export type FinanceCategory = {
  id: string;
  spaceId: string;
  parentId: string | null;
  name: string;
  kind: FinanceCategoryKind;
  color: string | null;
  children?: FinanceCategory[];
};

export type FinanceTag = {
  id: string;
  spaceId: string;
  name: string;
  color: string | null;
};

export type FinanceTransaction = {
  id: string;
  spaceId: string;
  type: FinanceTransactionType;
  amount: number;
  occurredAt: string;
  categoryId: string;
  categoryName: string;
  note: string | null;
  reminderId: string | null;
  tagIds: string[];
  tags: FinanceTag[];
  createdBy: string;
  createdAt: string;
};

export type FinanceSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    type: FinanceTransactionType;
    total: number;
  }>;
};

export type FinanceBudgetStatus = {
  id: string;
  year: number;
  month: number;
  amount: number;
  categoryId: string | null;
  tagId: string | null;
  label: string;
  spent: number;
  remaining: number;
  percent: number;
  overBudget: boolean;
};

export type FinanceGoal = {
  id: string;
  spaceId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: FinanceGoalStatus;
  percent: number;
  createdAt: string;
};

export type CreateTransactionPayload = {
  type: FinanceTransactionType;
  amount: number;
  occurredAt: string;
  categoryId: string;
  note?: string;
  tagIds?: string[];
  reminderId?: string;
};

export type CreateBudgetPayload = {
  year: number;
  month: number;
  amount: number;
  categoryId?: string;
  tagId?: string;
};

export type CreateGoalPayload = {
  name: string;
  targetAmount: number;
  deadline?: string;
};

export type FromReminderPayload = {
  amount: number;
  categoryId?: string;
  occurredAt?: string;
  note?: string;
  tagIds?: string[];
};
