import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type {
  CreateBudgetPayload,
  CreateGoalPayload,
  CreateTransactionPayload,
  FinanceBudgetStatus,
  FinanceCategory,
  FinanceGoal,
  FinanceInvite,
  FinanceMember,
  FinanceSpace,
  FinanceSummary,
  FinanceTag,
  FinanceTransaction,
  FromReminderPayload,
} from "./types/Finance.type";

const parseErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      message?: string;
      response?: {
        data?: {
          message?: string | string[];
          error?: string;
        };
      };
    };

    const backendMessage = err.response?.data?.message;
    if (Array.isArray(backendMessage) && backendMessage.length > 0) {
      return backendMessage.join(", ");
    }

    if (typeof backendMessage === "string" && backendMessage.trim().length > 0) {
      return backendMessage;
    }

    const backendError = err.response?.data?.error;
    if (typeof backendError === "string" && backendError.trim().length > 0) {
      return backendError;
    }

    if (typeof err.message === "string" && err.message.trim().length > 0) {
      return err.message;
    }
  }

  return "Error de comunicación con el servidor.";
};

const spacePath = (spaceId: string) => `/finance/spaces/${spaceId}`;

export const listFinanceSpaces = async (): Promise<
  ServiceResponse<FinanceSpace[]>
> => {
  try {
    const response = await axiosInstance.get("/finance/spaces");
    return { success: true, data: response.data as FinanceSpace[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createHouseholdSpace = async (
  name: string,
): Promise<ServiceResponse<FinanceSpace>> => {
  try {
    const response = await axiosInstance.post("/finance/spaces/household", {
      name,
    });
    return { success: true, data: response.data as FinanceSpace };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listSpaceMembers = async (
  spaceId: string,
): Promise<ServiceResponse<FinanceMember[]>> => {
  try {
    const response = await axiosInstance.get(`${spacePath(spaceId)}/members`);
    return { success: true, data: response.data as FinanceMember[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const updateMemberRole = async (
  spaceId: string,
  userId: string,
  role: string,
): Promise<ServiceResponse<FinanceMember[]>> => {
  try {
    const response = await axiosInstance.patch(
      `${spacePath(spaceId)}/members/${userId}`,
      { role },
    );
    return { success: true, data: response.data as FinanceMember[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const removeMember = async (
  spaceId: string,
  userId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`${spacePath(spaceId)}/members/${userId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createSpaceInvite = async (
  spaceId: string,
  email: string,
  role: string,
): Promise<ServiceResponse<FinanceInvite>> => {
  try {
    const response = await axiosInstance.post(`${spacePath(spaceId)}/invites`, {
      email,
      role,
    });
    return { success: true, data: response.data as FinanceInvite };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listSpaceInvites = async (
  spaceId: string,
): Promise<ServiceResponse<FinanceInvite[]>> => {
  try {
    const response = await axiosInstance.get(`${spacePath(spaceId)}/invites`);
    return { success: true, data: response.data as FinanceInvite[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const revokeSpaceInvite = async (
  spaceId: string,
  inviteId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`${spacePath(spaceId)}/invites/${inviteId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const acceptSpaceInvite = async (
  token: string,
): Promise<ServiceResponse<FinanceSpace>> => {
  try {
    const response = await axiosInstance.post(`/finance/invites/${token}/accept`);
    return { success: true, data: response.data as FinanceSpace };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listPendingInvites = async (): Promise<
  ServiceResponse<FinanceInvite[]>
> => {
  try {
    const response = await axiosInstance.get("/finance/invites/pending");
    return { success: true, data: response.data as FinanceInvite[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listCategories = async (
  spaceId: string,
): Promise<ServiceResponse<FinanceCategory[]>> => {
  try {
    const response = await axiosInstance.get(`${spacePath(spaceId)}/categories`);
    return { success: true, data: response.data as FinanceCategory[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createCategory = async (
  spaceId: string,
  payload: { name: string; parentId?: string; kind?: string; color?: string },
): Promise<ServiceResponse<FinanceCategory>> => {
  try {
    const response = await axiosInstance.post(
      `${spacePath(spaceId)}/categories`,
      payload,
    );
    return { success: true, data: response.data as FinanceCategory };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteCategory = async (
  spaceId: string,
  categoryId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`${spacePath(spaceId)}/categories/${categoryId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listTags = async (
  spaceId: string,
): Promise<ServiceResponse<FinanceTag[]>> => {
  try {
    const response = await axiosInstance.get(`${spacePath(spaceId)}/tags`);
    return { success: true, data: response.data as FinanceTag[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createTag = async (
  spaceId: string,
  name: string,
  color?: string,
): Promise<ServiceResponse<FinanceTag>> => {
  try {
    const response = await axiosInstance.post(`${spacePath(spaceId)}/tags`, {
      name,
      color,
    });
    return { success: true, data: response.data as FinanceTag };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteTag = async (
  spaceId: string,
  tagId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`${spacePath(spaceId)}/tags/${tagId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listTransactions = async (
  spaceId: string,
  params?: {
    type?: string;
    categoryId?: string;
    tagId?: string;
    from?: string;
    to?: string;
  },
): Promise<ServiceResponse<{ items: FinanceTransaction[]; total: number }>> => {
  try {
    const response = await axiosInstance.get(
      `${spacePath(spaceId)}/transactions`,
      { params },
    );
    return {
      success: true,
      data: response.data as { items: FinanceTransaction[]; total: number },
    };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createTransaction = async (
  spaceId: string,
  payload: CreateTransactionPayload,
): Promise<ServiceResponse<FinanceTransaction>> => {
  try {
    const response = await axiosInstance.post(
      `${spacePath(spaceId)}/transactions`,
      payload,
    );
    return { success: true, data: response.data as FinanceTransaction };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const updateTransaction = async (
  spaceId: string,
  txnId: string,
  payload: Partial<CreateTransactionPayload>,
): Promise<ServiceResponse<FinanceTransaction>> => {
  try {
    const response = await axiosInstance.patch(
      `${spacePath(spaceId)}/transactions/${txnId}`,
      payload,
    );
    return { success: true, data: response.data as FinanceTransaction };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteTransaction = async (
  spaceId: string,
  txnId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`${spacePath(spaceId)}/transactions/${txnId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const getFinanceSummary = async (
  spaceId: string,
  from?: string,
  to?: string,
): Promise<ServiceResponse<FinanceSummary>> => {
  try {
    const response = await axiosInstance.get(`${spacePath(spaceId)}/summary`, {
      params: { from, to },
    });
    return { success: true, data: response.data as FinanceSummary };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listBudgetStatus = async (
  spaceId: string,
  year: number,
  month: number,
): Promise<ServiceResponse<FinanceBudgetStatus[]>> => {
  try {
    const response = await axiosInstance.get(
      `${spacePath(spaceId)}/budgets/status`,
      { params: { year, month } },
    );
    return { success: true, data: response.data as FinanceBudgetStatus[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createBudget = async (
  spaceId: string,
  payload: CreateBudgetPayload,
): Promise<ServiceResponse<FinanceBudgetStatus>> => {
  try {
    const response = await axiosInstance.post(
      `${spacePath(spaceId)}/budgets`,
      payload,
    );
    return { success: true, data: response.data as FinanceBudgetStatus };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteBudget = async (
  spaceId: string,
  budgetId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`${spacePath(spaceId)}/budgets/${budgetId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const listGoals = async (
  spaceId: string,
): Promise<ServiceResponse<FinanceGoal[]>> => {
  try {
    const response = await axiosInstance.get(`${spacePath(spaceId)}/goals`);
    return { success: true, data: response.data as FinanceGoal[] };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createGoal = async (
  spaceId: string,
  payload: CreateGoalPayload,
): Promise<ServiceResponse<FinanceGoal>> => {
  try {
    const response = await axiosInstance.post(
      `${spacePath(spaceId)}/goals`,
      payload,
    );
    return { success: true, data: response.data as FinanceGoal };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const contributeGoal = async (
  spaceId: string,
  goalId: string,
  amount: number,
  note?: string,
): Promise<ServiceResponse<FinanceGoal>> => {
  try {
    const response = await axiosInstance.post(
      `${spacePath(spaceId)}/goals/${goalId}/contribute`,
      { amount, note },
    );
    return { success: true, data: response.data as FinanceGoal };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const deleteGoal = async (
  spaceId: string,
  goalId: string,
): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`${spacePath(spaceId)}/goals/${goalId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};

export const createFromReminder = async (
  spaceId: string,
  reminderId: string,
  payload: FromReminderPayload,
): Promise<ServiceResponse<FinanceTransaction>> => {
  try {
    const response = await axiosInstance.post(
      `${spacePath(spaceId)}/from-reminder/${reminderId}`,
      payload,
    );
    return { success: true, data: response.data as FinanceTransaction };
  } catch (error) {
    return { success: false, error: parseErrorMessage(error) };
  }
};
