"use client";

import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { useModal } from "../../components/ModalProvider";
import { listWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, Workflow } from "../../lib/apiClient";

const TRIGGER_OPTIONS = [
  { value: "document_type", label: "Document Type" },
  { value: "department", label: "Department" },
  { value: "manual", label: "Manual" },
];

const ACTION_OPTIONS = [
  { value: "approve", label: "Approve" },
  { value: "review", label: "Review" },
  { value: "sign", label: "Sign" },
];

export default function WorkflowsPage() {
  const { alert, confirm } = useModal();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [formData, setFormData] = useState<Partial<Workflow>>({
    name: "",
    description: "",
    trigger: "document_type" as const,
    triggerValue: "",
    enabled: true,
    steps: [{ order: 1, approvers: [], action: "approve" as const, dueInDays: 3 }],
  });

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error("Failed to load workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleOpenModal = (workflow?: Workflow) => {
    if (workflow) {
      setEditingWorkflow(workflow);
      setFormData({
        name: workflow.name,
        description: workflow.description || "",
        trigger: workflow.trigger,
        triggerValue: workflow.triggerValue || "",
        enabled: workflow.enabled,
        steps:
          (workflow.steps?.length || 0) > 0
            ? workflow.steps
            : [{ order: 1, approvers: [], action: "approve", dueInDays: 3 }],
      });
    } else {
      setEditingWorkflow(null);
      setFormData({
        name: "",
        description: "",
        trigger: "document_type",
        triggerValue: "",
        enabled: true,
        steps: [{ order: 1, approvers: [], action: "approve", dueInDays: 3 }],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWorkflow(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWorkflow) {
        await updateWorkflow(editingWorkflow._id, formData);
        await alert("Workflow updated successfully", { title: "Success" });
      } else {
        await createWorkflow(formData as Omit<Workflow, "_id" | "createdAt">);
        await alert("Workflow created successfully", { title: "Success" });
      }
      handleCloseModal();
      loadWorkflows();
    } catch (err: any) {
      await alert(err.message || "Failed to save workflow", { title: "Error" });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm("Are you sure you want to delete this workflow?", {
      title: "Confirm",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!ok) return;
    try {
      await deleteWorkflow(id);
      await alert("Workflow deleted successfully", { title: "Success" });
      loadWorkflows();
    } catch (err: any) {
      await alert(err.message || "Failed to delete workflow", { title: "Error" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loader"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Workflows</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage document approval workflows and automation rules
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>Create Workflow</Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No workflows configured</p>
            <Button className="mt-4" onClick={() => handleOpenModal()}>
              Create Your First Workflow
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {workflow.name}
                    </h3>
                    <Badge variant={workflow.enabled ? "success" : "default"}>
                      {workflow.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      {workflow.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <span>Trigger: {workflow.trigger}</span>
                    {workflow.triggerValue && <span>• {workflow.triggerValue}</span>}
                    <span>• {workflow.steps?.length || 0} steps</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(workflow)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(workflow._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Workflow Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              {editingWorkflow ? "Edit Workflow" : "Create New Workflow"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Workflow Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <Input
                label="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Select
                label="Trigger Type"
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value as any })}
                options={TRIGGER_OPTIONS}
              />

              {formData.trigger !== "manual" && (
                <Input
                  label="Trigger Value"
                  value={formData.triggerValue}
                  onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                  placeholder={formData.trigger === "document_type" ? "e.g., Policy" : "e.g., HR"}
                  helperText={`Workflow will trigger when ${formData.trigger === "document_type" ? "document type" : "department"} matches this value`}
                />
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Enable workflow immediately</label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">{editingWorkflow ? "Update" : "Create"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


