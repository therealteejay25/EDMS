// Frontend API Client with caching, error handling, and state management
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APIClient {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();

  private getCacheKey(method: string, url: string): string {
    return `${method}:${url}`;
  }

  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < CACHE_TTL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { skipCache?: boolean } = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const method = options.method || "GET";
    const cacheKey = this.getCacheKey(method, url);

    // Check cache for GET requests
    if (method === "GET" && !options.skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached.data;
      }
    }

    // Use request deduplication for identical in-flight requests
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    const promise = (async () => {
      try {
        const response = await fetch(url, {
          credentials: "include",
          ...options,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            error.message || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Cache GET responses
        if (method === "GET") {
          this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now(),
          });
        }

        // Return data as-is (backend already structures it correctly)
        return data;
      } finally {
        this.requestQueue.delete(cacheKey);
      }
    })();

    this.requestQueue.set(cacheKey, promise);
    return promise;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheEntry(endpoint: string): void {
    const keys = Array.from(this.cache.keys()).filter((k) =>
      k.includes(endpoint)
    );
    keys.forEach((k) => this.cache.delete(k));
  }
}

const client = new APIClient();

// ===================== Documents =====================

export interface Document {
  _id: string;
  title: string;
  type: string;
  department: string;
  status: "draft" | "active" | "archived" | "expired";
  owner: { _id: string; name: string; email: string };
  fileUrl: string;
  version: number;
  tags: string[];
  legalHold: boolean;
  approvalRequired: boolean;
  approvalChain: string[];
  effectiveDate?: string;
  expiryDate?: string;
  retentionYears?: number;
  history: Array<{
    version: number;
    fileUrl: string;
    uploadedAt: string;
    uploadedBy: { name: string };
    extractedText?: string;
  }>;
  comments: Array<{
    userId: string;
    name: string;
    comment: string;
    createdAt: string;
  }>;
  activity: Array<{
    userId: string;
    action: string;
    details?: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentListResponse {
  data: Document[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listDocuments(
  filter: {
    q?: string;
    search?: string;
    type?: string;
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<DocumentListResponse> {
  const params = new URLSearchParams();
  if (filter.q) params.set("search", filter.q);
  if (filter.search) params.set("search", filter.search);
  if (filter.type) params.set("type", filter.type);
  if (filter.department) params.set("department", filter.department);
  if (filter.status) params.set("status", filter.status);
  if (filter.page) params.set("page", String(filter.page));
  if (filter.limit) params.set("limit", String(filter.limit));

  const result = await client.request(`/documents?${params.toString()}`);
  // Backend returns { data, total, page, pageSize }
  // Handle both response formats for compatibility
  if (result && typeof result === "object") {
    return {
      data: result.data || result.docs || [],
      total: result.total || 0,
      page: result.page || filter.page || 1,
      pageSize: result.pageSize || result.limit || 20,
    };
  }
  return {
    data: [],
    total: 0,
    page: filter.page || 1,
    pageSize: filter.limit || 20,
  };
}

export async function getDocument(
  id: string
): Promise<{ doc: Document; approvals: any[]; auditLog: any[] }> {
  const result = await client.request(`/documents/${id}`);
  // Backend returns { doc, approvals, auditLog }
  return {
    doc: result.doc || result,
    approvals: result.approvals || [],
    auditLog: result.auditLog || [],
  };
}

export async function uploadDocument(
  form: FormData
): Promise<{ doc: Document }> {
  const result = await client.request("/documents", {
    method: "POST",
    body: form,
    skipCache: true,
  });
  client.clearCacheEntry("/documents");
  return {
    doc: result.doc || result,
  };
}

export async function uploadDocumentVersion(
  docId: string,
  form: FormData
): Promise<{ doc: Document }> {
  client.clearCacheEntry(`/documents/${docId}`);
  client.clearCacheEntry("/documents");
  const result = await client.request(`/documents/${docId}/version`, {
    method: "POST",
    body: form,
    skipCache: true,
  });
  return {
    doc: result.doc || result,
  };
}

export async function addDocumentComment(
  docId: string,
  comment: string
): Promise<{ ok: boolean }> {
  client.clearCacheEntry(`/documents/${docId}`);
  return client.request(`/documents/${docId}/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
}

export async function addDocumentTag(
  docId: string,
  tags: string[]
): Promise<{ doc: Document }> {
  client.clearCacheEntry(`/documents/${docId}`);
  return client.request(`/documents/${docId}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
  });
}

export async function archiveDocument(
  docId: string
): Promise<{ doc: Document }> {
  client.clearCacheEntry(`/documents/${docId}`);
  client.clearCacheEntry("/documents");
  return client.request(`/documents/${docId}/archive`, {
    method: "POST",
  });
}

export async function setDocumentLegalHold(
  docId: string,
  legalHold: boolean
): Promise<{ doc: Document }> {
  client.clearCacheEntry(`/documents/${docId}`);
  return client.request(`/documents/${docId}/legal-hold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hold: legalHold }),
  });
}

export async function restoreDocumentVersion(
  docId: string,
  version: number
): Promise<{ doc: Document }> {
  client.clearCacheEntry(`/documents/${docId}`);
  client.clearCacheEntry("/documents");
  return client.request(`/documents/${docId}/restore-version`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version }),
  });
}

export async function requestDocumentApproval(
  docId: string,
  assignee: string,
  priority?: string,
  dueDate?: string
): Promise<{ approval: any }> {
  client.clearCacheEntry(`/documents/${docId}`);
  client.clearCacheEntry("/approvals");
  const result = await client.request(`/documents/${docId}/request-approval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignee, priority: priority || "medium", dueDate }),
    skipCache: true,
  });
  return {
    approval: result.approval || result,
  };
}

// ===================== Approvals =====================

export interface Approval {
  _id: string;
  docId: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  requestedBy: { _id: string; name: string };
  assignee: { _id: string; name: string; email: string };
  decidedBy?: { _id: string; name: string };
  comment?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  escalatedTo?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export async function listApprovals(
  filter: { status?: string; page?: number } = {}
): Promise<{ data: Approval[]; total: number }> {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.page) params.set("page", String(filter.page));

  const result = await client.request(`/approvals?${params.toString()}`);
  // Backend returns { data, total, page }
  return {
    data: result.data || [],
    total: result.total || 0,
  };
}

export async function getMyPendingApprovals(): Promise<Approval[]> {
  try {
    const result = await client.request("/approvals/pending", {
      skipCache: true,
    });
    // Backend returns array directly or { approvals: [...] }
    if (Array.isArray(result)) return result;
    if (result.approvals && Array.isArray(result.approvals))
      return result.approvals;
    return [];
  } catch (err) {
    console.warn("Failed to load pending approvals:", err);
    return [];
  }
}

export async function getDocumentApprovals(docId: string): Promise<Approval[]> {
  try {
    // Backend returns approvals as part of getDocument response
    const docData = await getDocument(docId);
    return docData.approvals || [];
  } catch (err) {
    console.warn("Failed to load document approvals:", err);
    return [];
  }
}

export async function approveDocument(
  approvalId: string,
  comment?: string
): Promise<Approval> {
  client.clearCacheEntry("/approvals");
  const result = await client.request(`/approvals/${approvalId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  return result.approval || result;
}

export async function rejectDocument(
  approvalId: string,
  comment?: string
): Promise<Approval> {
  client.clearCacheEntry("/approvals");
  const result = await client.request(`/approvals/${approvalId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  return result.approval || result;
}

export async function escalateApproval(approvalId: string): Promise<Approval> {
  client.clearCacheEntry("/approvals");
  const result = await client.request(`/approvals/${approvalId}/escalate`, {
    method: "POST",
  });
  return result.approval || result;
}

export async function getOverdueApprovals(): Promise<Approval[]> {
  const result = await client.request("/approvals/overdue");
  return Array.isArray(result) ? result : result.overdue || [];
}

// ===================== Workflows =====================

export interface Workflow {
  _id: string;
  name: string;
  description?: string;
  trigger: "document_type" | "department" | "manual";
  triggerValue?: string;
  steps: Array<{
    order: number;
    approvers: string[];
    action: "approve" | "review" | "sign";
    dueInDays?: number;
  }>;
  enabled: boolean;
  createdAt: string;
}

export async function listWorkflows(): Promise<Workflow[]> {
  return client.request("/workflows");
}

export async function getWorkflow(id: string): Promise<Workflow> {
  return client.request(`/workflows/${id}`);
}

export async function createWorkflow(
  workflow: Omit<Workflow, "_id" | "createdAt">
): Promise<Workflow> {
  client.clearCacheEntry("/workflows");
  return client.request("/workflows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workflow),
  });
}

export async function updateWorkflow(
  id: string,
  updates: Partial<Workflow>
): Promise<Workflow> {
  client.clearCacheEntry("/workflows");
  client.clearCacheEntry(`/workflows/${id}`);
  return client.request(`/workflows/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function deleteWorkflow(
  id: string
): Promise<{ success: boolean }> {
  client.clearCacheEntry("/workflows");
  return client.request(`/workflows/${id}`, { method: "DELETE" });
}

export async function testWorkflow(
  workflow: Partial<Workflow>,
  docType: string
): Promise<{ matched: boolean }> {
  return client.request("/workflows/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflow, docType }),
  });
}

// ===================== Audit =====================

export interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId: string;
  user: { _id: string; name: string; email: string };
  changes?: any;
  metadata?: any;
  createdAt: string;
}

export async function listAuditLogs(
  filter: {
    resource?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
  } = {}
): Promise<{ data: AuditLog[]; total: number }> {
  const params = new URLSearchParams();
  if (filter.resource) params.set("resource", filter.resource);
  if (filter.action) params.set("action", filter.action);
  if (filter.startDate) params.set("startDate", filter.startDate);
  if (filter.endDate) params.set("endDate", filter.endDate);
  if (filter.page) params.set("page", String(filter.page));

  return client.request(`/audit?${params.toString()}`);
}

export async function getDocumentAuditLog(docId: string): Promise<AuditLog[]> {
  return client.request(`/documents/${docId}/audit`);
}

export async function exportAuditLog(
  filter?: Record<string, any>
): Promise<Blob> {
  const params = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
  }

  const response = await fetch(`${API_URL}/audit/export?${params.toString()}`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Export failed");
  return response.blob();
}

// ===================== Auth =====================

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "department_lead" | "user";
  department?: string;
  org: string;
}

export async function getCurrentUser(): Promise<User> {
  const result = await client.request("/auth/me", { skipCache: true });
  return result.user || result;
}

export async function logout(): Promise<void> {
  client.clearCache();
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

// ===================== Utility =====================

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString();
}

export function getBadgeVariant(
  status: string
): "success" | "warning" | "danger" | "default" {
  if (status === "active" || status === "approved") return "success";
  if (status === "pending" || status === "draft") return "warning";
  if (status === "rejected" || status === "archived") return "danger";
  return "default";
}
