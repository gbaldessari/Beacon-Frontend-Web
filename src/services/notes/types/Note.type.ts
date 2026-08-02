export type NoteLabel = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type NoteChecklistItem = {
  id: string;
  text: string;
  done: boolean;
  position: number;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  color: string;
  pinned: boolean;
  archived: boolean;
  isChecklist: boolean;
  position: number;
  checklistItems: NoteChecklistItem[];
  labels: NoteLabel[];
  createdAt: string;
  updatedAt: string;
};

export type CreateNotePayload = {
  title?: string;
  body?: string;
  color?: string;
  pinned?: boolean;
  isChecklist?: boolean;
  checklistItems?: Array<{ text: string; done?: boolean; position?: number }>;
  labelIds?: string[];
};

export type UpdateNotePayload = {
  title?: string;
  body?: string;
  color?: string;
  pinned?: boolean;
  archived?: boolean;
  isChecklist?: boolean;
  position?: number;
  checklistItems?: Array<{
    id?: string;
    text: string;
    done?: boolean;
    position?: number;
  }>;
  labelIds?: string[];
};

export type ListNotesParams = {
  archived?: boolean;
  labelId?: string;
  q?: string;
};
