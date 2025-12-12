const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface AuditLog {
  _id: string;
  user: any;
  action: string;
  resource: string;
  resourceId: string;
  changes?: any;
  createdAt: string;
}

export async function getAuditLog(filters: Record<string, any> = {}) {
  const params = new URLSearchParams({
    ...filters,
    limit: "50",
  });

  const res = await fetch(`${API_URL}/audit?${params}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to get audit log");
  return res.json();
}

export async function getDocumentAudit(docId: string) {
  const res = await fetch(`${API_URL}/audit/${docId}/document`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to get document audit");
  return res.json();
}

export async function exportAuditLog(filters: Record<string, any> = {}) {
  const params = new URLSearchParams(filters);

  const res = await fetch(`${API_URL}/audit/export?${params}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to export audit log");
  return res.blob();
}

export async function checkRetention() {
  const res = await fetch(`${API_URL}/audit/retention/check`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to check retention");
  return res.json();
}

export async function pruneOldDocuments(retentionYears: number = 7) {
  const res = await fetch(`${API_URL}/audit/retention/prune`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ retentionYears }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to prune documents");
  return res.json();
}
