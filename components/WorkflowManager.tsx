"use client";

import { useState, useEffect } from "react";
import * as WorkflowService from "@/lib/workflowService";

export default function WorkflowManager() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "manual",
    triggerValue: "",
    steps: [] as any[],
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const result = await WorkflowService.listWorkflows();
      setWorkflows(result.workflows);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await WorkflowService.createWorkflow(formData);
      setFormData({
        name: "",
        description: "",
        trigger: "manual",
        triggerValue: "",
        steps: [],
      });
      setShowForm(false);
      fetchWorkflows();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create workflow");
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await WorkflowService.deleteWorkflow(id);
      fetchWorkflows();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete workflow");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Workflows</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "New Workflow"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-zinc-200 p-4">
          <form onSubmit={handleCreateWorkflow} className="space-y-3">
            <input
              type="text"
              placeholder="Workflow name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
            />
            <select
              value={formData.trigger}
              onChange={(e) =>
                setFormData({ ...formData, trigger: e.target.value })
              }
              className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
            >
              <option value="manual">Manual</option>
              <option value="document_type">Document Type</option>
              <option value="department">Department</option>
            </select>
            {formData.trigger !== "manual" && (
              <input
                type="text"
                placeholder={`${formData.trigger} value`}
                value={formData.triggerValue}
                onChange={(e) =>
                  setFormData({ ...formData, triggerValue: e.target.value })
                }
                className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
              />
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Create Workflow
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No workflows created yet
        </div>
      ) : (
        <div className="grid gap-3">
          {workflows.map((workflow) => (
            <div
              key={workflow._id}
              className="bg-white rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{workflow.name}</h3>
                  <p className="text-sm text-gray-600">
                    {workflow.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {workflow.trigger}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        workflow.enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {workflow.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteWorkflow(workflow._id)}
                  className="px-3 py-1 text-red-600 text-sm hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
