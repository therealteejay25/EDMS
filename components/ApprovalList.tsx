"use client";

import { useEffect, useState } from "react";
import {
  getPendingApprovals,
  approveDocument,
  rejectDocument,
} from "@/lib/approvalService";

export default function ApprovalList() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        const result = await getPendingApprovals();
        setApprovals(result.approvals);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load approvals"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const handleApprove = async (approvalId: string) => {
    setProcessingId(approvalId);
    try {
      await approveDocument(approvalId);
      setApprovals((prev) => prev.filter((a) => a._id !== approvalId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setProcessingId("");
    }
  };

  const handleReject = async (approvalId: string) => {
    const comment = prompt("Reason for rejection:");
    if (comment === null) return;

    setProcessingId(approvalId);
    try {
      await rejectDocument(approvalId, comment);
      setApprovals((prev) => prev.filter((a) => a._id !== approvalId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setProcessingId("");
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading approvals...</div>;
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error}
      </div>
    );

  const priorityColor: Record<string, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6">
      <h2 className="text-lg font-semibold mb-4">
        Pending Approvals ({approvals.length})
      </h2>

      {approvals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending approvals
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <div
              key={approval._id}
              className="flex items-start justify-between border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50"
            >
              <div className="flex-1">
                <h3 className="font-medium">{approval.docId?.title}</h3>
                <p className="text-sm text-gray-600">{approval.docId?.type}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      priorityColor[approval.priority] || "bg-gray-100"
                    }`}
                  >
                    {approval.priority}
                  </span>
                  {approval.dueDate && (
                    <span className="text-xs text-gray-500">
                      Due: {new Date(approval.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleApprove(approval._id)}
                  disabled={processingId === approval._id}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {processingId === approval._id ? "..." : "Approve"}
                </button>
                <button
                  onClick={() => handleReject(approval._id)}
                  disabled={processingId === approval._id}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {processingId === approval._id ? "..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
