export type CalendarType = "personal" | "shared";
export type CalendarMemberRole = "owner" | "editor" | "viewer";
export type CalendarInviteStatus =
  | "pending"
  | "accepted"
  | "revoked"
  | "expired";

export type Calendar = {
  id: string;
  name: string;
  color: string;
  type: CalendarType;
  role: CalendarMemberRole;
  createdAt: string;
};

export type CalendarMember = {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: CalendarMemberRole;
  createdAt: string;
};

export type CalendarInvite = {
  id: string;
  email: string;
  role: CalendarMemberRole;
  status: CalendarInviteStatus;
  token: string;
  expiresAt: string;
  createdAt: string;
  calendarId?: string;
  calendarName?: string;
};
