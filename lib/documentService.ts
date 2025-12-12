const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface Document {
  id: string;
  title: string;
  type: string;
  department: string;
  status: "draft" | "active" | "archived" | "expired";
  owner: any;
  version: number;
  tags: string[];
  approvalRequired: boolean;
  legalHold: boolean;
  updatedAt: string;
}

export interface Approval {
  _id: string;
  docId: Document;
  status: "pending" | "approved" | "rejected" | "escalated";
  assignee: any;
  decidedBy: any;
  priority: "low" | "medium" | "high";
  dueDate: string;
  comment?: string;
}

export async function searchDocuments(
  filters: Record<string, any>,
  page: number = 1
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
  });
  
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.department) params.set("department", filters.department);
  if (filters.status) params.set("status", filters.status);

  const res = await fetch(`${API_URL}/documents?${params}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to search documents");
  const data = await res.json();
  return {
    docs: data.data || [],
    total: data.total || 0,
  };
}

export async function getDocument(id: string) {
  const res = await fetch(`${API_URL}/documents/${id}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export async function uploadDocument(formData: FormData) {
  const res = await fetch(`${API_URL}/documents`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to upload document");
  return res.json();
}

export async function uploadVersion(docId: string, formData: FormData) {
  const res = await fetch(`${API_URL}/documents/${docId}/version`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to upload version");
  return res.json();
}

export async function getVersionHistory(docId: string) {
  const res = await fetch(`${API_URL}/documents/${docId}/version-history`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to get version history");
  return res.json();
}

export async function restoreVersion(docId: string, version: number) {
  const res = await fetch(`${API_URL}/documents/${docId}/restore-version`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to restore version");
  return res.json();
}

export async function addComment(docId: string, comment: string) {
  const res = await fetch(`${API_URL}/documents/${docId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

export async function addTags(docId: string, tags: string[]) {
  const res = await fetch(`${API_URL}/documents/${docId}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to add tags");
  return res.json();
}

export async function requestApproval(
  docId: string,
  assignee: string,
  priority?: string,
  dueDate?: string
) {
  const res = await fetch(`${API_URL}/documents/${docId}/request-approval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignee, priority, dueDate }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to request approval");
  return res.json();
}

export async function archiveDocument(docId: string) {
  const res = await fetch(`${API_URL}/documents/${docId}/archive`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to archive document");
  return res.json();
}

export async function setLegalHold(docId: string, hold: boolean) {
  const res = await fetch(`${API_URL}/documents/${docId}/legal-hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hold }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to set legal hold");
  return res.json();
}

export async function extractText(docId: string) {
  const res = await fetch(`${API_URL}/documents/${docId}/extract-text`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to extract text");
  return res.json();
}
