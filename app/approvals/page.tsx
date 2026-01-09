"use client";
import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { useModal } from "../../components/ModalProvider";
import {
  listApprovals,
  approveDocument,
  rejectDocument,
  escalateApproval,
  formatDateTime,
} from "../../lib/apiClient";
import { approvalStatusLabel, priorityLabel, titleCase } from "../../lib/display";

interface Approval {
  _id: string;
  docId: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  requestedBy: { _id: string; name: string };
  assignee: { _id: string; name: string; email: string };
  comment?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export default function ApprovalsPage() {
  const { alert, confirm } = useModal();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await listApprovals(
        filter === "pending" ? { status: "pending" } : {}
      );
      setApprovals(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to load approvals:", error);
      setApprovals([]);
      await alert("Failed to load approvals: " + (error?.message || "Unknown error"), {
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const handleApprove = async (approvalId: string, comment?: string) => {
    setProcessingId(approvalId);
    try {
      await approveDocument(approvalId, comment);
      await alert("Document approved!", { title: "Success" });
      loadApprovals();
    } catch (error) {
      await alert("Failed to approve: " + (error?.message || "Unknown error"), {
        title: "Error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    const ok = await confirm("Reject this approval?", {
      title: "Confirm",
      confirmText: "Reject",
      cancelText: "Cancel",
    });
    if (!ok) return;
    setProcessingId(approvalId);
    try {
      await rejectDocument(approvalId);
      await alert("Document rejected!", { title: "Success" });
      loadApprovals();
    } catch (error) {
      await alert("Failed to reject: " + (error?.message || "Unknown error"), {
        title: "Error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleEscalate = async (approvalId: string) => {
    const ok = await confirm("Escalate this approval to your manager?", {
      title: "Confirm",
      confirmText: "Escalate",
      cancelText: "Cancel",
    });
    if (!ok) return;
    setProcessingId(approvalId);
    try {
      await escalateApproval(approvalId);
      await alert("Escalated!", { title: "Success" });
      loadApprovals();
    } catch (error) {
      await alert("Failed to escalate: " + (error?.message || "Unknown error"), {
        title: "Error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Approvals
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Review and approve pending document requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "pending" ? "primary" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center text-zinc-600 dark:text-zinc-400">
          Loading approvals...
        </div>
      ) : approvals.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-zinc-600 dark:text-zinc-400">
            <p>No approvals found</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {approvals.map((approval) => (
            <Card key={approval._id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Requested by
                    </p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {approval.requestedBy.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(approval.priority)}>
                      {priorityLabel(approval.priority) || titleCase(approval.priority)}
                    </Badge>
                    <Badge
                      variant={
                        approval.status === "pending" ? "warning" : "success"
                      }
                    >
                      {approvalStatusLabel(approval.status)}
                    </Badge>
                  </div>
                </div>

                {approval.dueDate && (
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Due: {formatDateTime(approval.dueDate)}
                  </div>
                )}

                {approval.comment && (
                  <div className="rounded-md bg-primary-50 dark:bg-primary-900/20 p-3 text-sm text-zinc-700 dark:text-zinc-300 border border-primary-200 dark:border-primary-800">
                    {approval.comment}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-zinc-200 dark:border-zinc-700 pt-3">
                  <Button
                    onClick={() => handleApprove(approval._id)}
                    disabled={
                      processingId === approval._id ||
                      approval.status !== "pending"
                    }
                    loading={processingId === approval._id}
                    loadingText="Approving..."
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(approval._id)}
                    disabled={
                      processingId === approval._id ||
                      approval.status !== "pending"
                    }
                    loading={processingId === approval._id}
                    loadingText="Rejecting..."
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEscalate(approval._id)}
                    disabled={
                      processingId === approval._id ||
                      approval.status !== "pending"
                    }
                    loading={processingId === approval._id}
                    loadingText="Escalating..."
                  >
                    Escalate
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const docId =
                        typeof approval.docId === "string"
                          ? approval.docId
                          : (approval.docId as any)?._id || approval.docId;
                      window.location.href = `/documents/${docId}`;
                    }}
                  >
                    View Document
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
