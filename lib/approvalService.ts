const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Approval {
  _id: string;
  docId: any;
  status: "pending" | "approved" | "rejected" | "escalated";
  assignee: any;
  decidedBy: any;
  priority: string;
  dueDate: string;
  comment?: string;
}

export async function getPendingApprovals() {
  const res = await fetch(`${API_URL}/approvals/pending/mine`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to get pending approvals");
  return res.json();
}

export async function listApprovals(filters: Record<string, any> = {}) {
  const params = new URLSearchParams({
    ...filters,
    limit: "20",
  });

  const res = await fetch(`${API_URL}/approvals?${params}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to list approvals");
  return res.json();
}

export async function approveDocument(approvalId: string, comment?: string) {
  const res = await fetch(`${API_URL}/approvals/${approvalId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to approve document");
  return res.json();
}

export async function rejectDocument(approvalId: string, comment?: string) {
  const res = await fetch(`${API_URL}/approvals/${approvalId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to reject document");
  return res.json();
}

export async function escalateApproval(
  approvalId: string,
  escalateToId: string
) {
  const res = await fetch(`${API_URL}/approvals/${approvalId}/escalate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ escalateToId }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to escalate approval");
  return res.json();
}

export async function getApprovalStatus(docId: string) {
  const res = await fetch(`${API_URL}/approvals/${docId}/status`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to get approval status");
  return res.json();
}

export async function getOverdueApprovals() {
  const res = await fetch(`${API_URL}/approvals/overdue/list`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to get overdue approvals");
  return res.json();
}

export async function sendReminderNotification(approvalId: string) {
  const res = await fetch(`${API_URL}/approvals/${approvalId}/reminder`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to send reminder");
  return res.json();
}

export async function bulkApprove(department: string) {
  const res = await fetch(`${API_URL}/approvals/bulk/approve-department`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ department }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to bulk approve");
  return res.json();
}
