"use client";

import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { listWorkflows, Workflow } from "../../lib/apiClient";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listWorkflows();
        setWorkflows(data);
      } catch (err) {
        console.error("Failed to load workflows:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        <Button>Create Workflow</Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No workflows configured</p>
            <Button className="mt-4">Create Your First Workflow</Button>
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
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm">Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


