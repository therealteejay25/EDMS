"use client";
import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  listWorkflows,
  createWorkflow,
  deleteWorkflow,
  listAuditLogs,
  exportAuditLog,
  formatDateTime,
} from "../../lib/apiClient";

interface Workflow {
  _id: string;
  name: string;
  trigger: string;
  triggerValue?: string;
  steps: Array<{ order: number; action: string; dueInDays?: number }>;
  enabled: boolean;
}

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  user: { name: string };
  createdAt: string;
}

export default function OrgSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "workflows" | "audit" | "retention"
  >("workflows");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    trigger: "document_type",
    triggerValue: "",
  });

  const loadWorkflows = async () => {
    try {
      const data = await listWorkflows();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load workflows:", error);
      setWorkflows([]); // Ensure it's always an array
      alert("Failed to load workflows");
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await listAuditLogs();
      setAuditLogs(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      setAuditLogs([]); // Ensure it's always an array
      alert("Failed to load audit logs");
    }
  };

  useEffect(() => {
    if (activeTab === "workflows") {
      loadWorkflows();
    } else if (activeTab === "audit") {
      loadAuditLogs();
    }
  }, [activeTab]);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createWorkflow({
        ...newWorkflow,
        trigger: newWorkflow.trigger as "document_type" | "department" | "manual",
        steps: [
          {
            order: 1,
            approvers: [],
            action: "approve" as const,
            dueInDays: 3,
          },
        ],
        enabled: true,
      } as Omit<Workflow, "_id" | "createdAt">);
      alert("Workflow created!");
      setNewWorkflow({ name: "", trigger: "document_type", triggerValue: "" });
      loadWorkflows();
    } catch (error: any) {
      alert("Failed to create workflow: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm("Delete this workflow?")) return;
    try {
      await deleteWorkflow(id);
      alert("Workflow deleted");
      loadWorkflows();
    } catch (error: any) {
      alert("Failed to delete: " + error.message);
    }
  };

  const handleExportAudit = async () => {
    try {
      const blob = await exportAuditLog();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert("Failed to export: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Organization Settings</h1>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-4">
          {(["workflows", "audit", "retention"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {tab === "workflows"
                ? "Workflows"
                : tab === "audit"
                ? "Audit Logs"
                : "Retention"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "workflows" && (
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Create New Workflow</h2>
            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <Input
                label="Workflow Name"
                value={newWorkflow.name}
                onChange={(e) =>
                  setNewWorkflow({ ...newWorkflow, name: e.target.value })
                }
                required
              />

              <label className="flex flex-col gap-2 text-sm">
                <span>Trigger Type</span>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, trigger: e.target.value })
                  }
                  className="rounded-md border border-zinc-200 px-3 py-2"
                >
                  <option value="document_type">Document Type</option>
                  <option value="department">Department</option>
                  <option value="manual">Manual</option>
                </select>
              </label>

              {newWorkflow.trigger !== "manual" && (
                <Input
                  label="Trigger Value"
                  value={newWorkflow.triggerValue}
                  onChange={(e) =>
                    setNewWorkflow({
                      ...newWorkflow,
                      triggerValue: e.target.value,
                    })
                  }
                  placeholder={
                    newWorkflow.trigger === "document_type"
                      ? "e.g., Policy"
                      : "e.g., HR"
                  }
                />
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Workflow"}
              </Button>
            </form>
          </Card>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Existing Workflows</h2>
            {workflows.length === 0 ? (
              <Card>
                <p className="text-center text-zinc-600">No workflows yet</p>
              </Card>
            ) : (
              workflows.map((wf) => (
                <Card key={wf._id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{wf.name}</h3>
                      <p className="text-sm text-zinc-600 mt-1">
                        Trigger: {wf.trigger}
                        {wf.triggerValue && ` - ${wf.triggerValue}`}
                      </p>
                      <p className="text-sm text-zinc-600">
                        Steps: {wf.steps.length}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteWorkflow(wf._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleExportAudit}>Export as CSV</Button>
          </div>

          <Card>
            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-center text-zinc-600">No audit logs</p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start justify-between border-b border-zinc-200 pb-3 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{log.action}</p>
                      <p className="text-sm text-zinc-600">{log.resource}</p>
                      <p className="text-xs text-zinc-500">
                        {log.user.name} - {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "retention" && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Retention Policies</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Policy Documents</p>
              <p className="mt-1 text-sm text-zinc-600">Retention: 7 years</p>
            </div>
            <div>
              <p className="font-semibold">Procedure Documents</p>
              <p className="mt-1 text-sm text-zinc-600">Retention: 5 years</p>
            </div>
            <div>
              <p className="font-semibold">Forms</p>
              <p className="mt-1 text-sm text-zinc-600">Retention: 3 years</p>
            </div>
            <Button variant="outline" className="mt-4">
              Edit Retention Policy
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
