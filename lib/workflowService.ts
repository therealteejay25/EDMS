const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Workflow {
  _id: string;
  name: string;
  description?: string;
  trigger: "document_type" | "department" | "manual";
  triggerValue?: string;
  steps: any[];
  enabled: boolean;
}

export async function listWorkflows() {
  const res = await fetch(`${API_URL}/workflows`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to list workflows");
  return res.json();
}

export async function getWorkflow(id: string) {
  const res = await fetch(`${API_URL}/workflows/${id}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to get workflow");
  return res.json();
}

export async function createWorkflow(workflow: Partial<Workflow>) {
  const res = await fetch(`${API_URL}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workflow),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to create workflow");
  return res.json();
}

export async function updateWorkflow(id: string, workflow: Partial<Workflow>) {
  const res = await fetch(`${API_URL}/workflows/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workflow),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to update workflow");
  return res.json();
}

export async function deleteWorkflow(id: string) {
  const res = await fetch(`${API_URL}/workflows/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to delete workflow");
  return res.json();
}

export async function testWorkflow(
  id: string,
  docType: string,
  department: string
) {
  const res = await fetch(`${API_URL}/workflows/${id}/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docType, department }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to test workflow");
  return res.json();
}
