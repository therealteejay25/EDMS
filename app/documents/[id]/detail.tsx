"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getDocument,
  uploadDocumentVersion,
  addDocumentComment,
  requestDocumentApproval,
  addDocumentTag,
  archiveDocument,
  setDocumentLegalHold,
  restoreDocumentVersion,
} from "@/lib/apiClient";
import Link from "next/link";
import { useModal } from "@/components/ModalProvider";
import { documentStatusLabel, titleCase } from "@/lib/display";

export default function DocumentDetailPage() {
  const { alert, confirm } = useModal();
  const params = useParams();
  const docId = params.id as string;
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const baseFileUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000"
    }${doc?.fileUrl || ""}`;

  const fileExt = String(doc?.fileUrl || "")
    .split("?")[0]
    .split("#")[0]
    .split(".")
    .pop()
    ?.toLowerCase();

  useEffect(() => {
    fetchDocument();
  }, [docId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const result = await getDocument(docId);
      setDoc(result.doc);
      setVersionHistory(result.doc?.history || []);
      setApprovals(result.approvals || []);
      setAuditLogs(result.auditLog || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addDocumentComment(docId, comment);
      setComment("");
      // Refresh document to get updated comments
      await fetchDocument();
    } catch (err) {
      await alert(err instanceof Error ? err.message : "Failed to add comment", {
        title: "Error",
      });
    }
  };

  const handleAddTags = async () => {
    if (!tags.trim()) return;

    try {
      await addDocumentTag(
        docId,
        tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      );
      setTags("");
      await fetchDocument();
    } catch (err) {
      await alert(err instanceof Error ? err.message : "Failed to add tags", {
        title: "Error",
      });
    }
  };

  const handleRequestApproval = async () => {
    try {
      const assignee = prompt("Enter assignee user ID (or email for lookup):");
      if (!assignee) return;
      const priority = prompt("Priority (low/medium/high):", "medium") || "medium";
      await requestDocumentApproval(docId, assignee, priority);
      await alert("Approval requested successfully", { title: "Success" });
      await fetchDocument();
    } catch (err) {
      await alert(
        err instanceof Error
          ? err.message
          : "Failed to request approval. Note: Assignee must be a valid user ID.",
        { title: "Error" }
      );
    }
  };

  const handleArchive = async () => {
    const ok = await confirm("Archive this document?", {
      title: "Confirm",
      confirmText: "Archive",
      cancelText: "Cancel",
    });
    if (!ok) return;
    try {
      await archiveDocument(docId);
      fetchDocument();
    } catch (err) {
      await alert(err instanceof Error ? err.message : "Failed to archive", {
        title: "Error",
      });
    }
  };

  const handleLegalHold = async (hold: boolean) => {
    try {
      await setDocumentLegalHold(docId, hold);
      fetchDocument();
    } catch (err) {
      await alert(err instanceof Error ? err.message : "Failed to set legal hold", {
        title: "Error",
      });
    }
  };

  const handleUploadVersion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (!input?.files?.[0]) return;

    try {
      const form = new FormData();
      form.append("file", input.files[0]);
      await uploadDocumentVersion(docId, form);
      await alert("New version uploaded successfully!", { title: "Success" });
      // Clear file input
      input.value = "";
      // Refresh document
      await fetchDocument();
    } catch (err) {
      await alert(err instanceof Error ? err.message : "Failed to upload version", {
        title: "Error",
      });
    }
  };

  const handleViewVersionHistory = async () => {
    try {
      // Version history is already loaded with document
      setActiveTab("versions");
    } catch (err) {
      await alert(
        err instanceof Error ? err.message : "Failed to load version history",
        { title: "Error" }
      );
    }
  };

  if (loading)
    return (<div><div className="loader"></div> <div className="text-center py-8">Loading document...</div></div>);
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error}
      </div>
    );
  if (!doc) return <div>Document not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/documents"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Documents
          </Link>
          <h1 className="text-3xl font-bold mt-2">{doc.title}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleArchive}
            className="px-4 py-2 border border-zinc-300 rounded hover:bg-zinc-50 text-sm"
          >
            Archive
          </button>
          <button
            onClick={() => handleLegalHold(!doc.legalHold)}
            className={`px-4 py-2 rounded text-sm ${doc.legalHold
                ? "bg-orange-600 text-white"
                : "border border-zinc-300 hover:bg-zinc-50"
              }`}
          >
            {doc.legalHold ? "Remove Hold" : "Legal Hold"}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-4 gap-4 bg-white rounded-lg border border-zinc-200 p-4">
        <div>
          <span className="text-xs font-medium text-gray-600">Type</span>
          <p className="text-sm font-medium">{titleCase(doc.type)}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-600">Department</span>
          <p className="text-sm font-medium">{doc.department}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-600">Version</span>
          <p className="text-sm font-medium">v{doc.version}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-600">Status</span>
          <p className="text-sm font-medium">{documentStatusLabel(doc.status)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-zinc-200">
        <div className="flex border-b border-zinc-200">
          {["details", "versions", "approvals", "comments", "audit"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        <div className="p-4">
          {activeTab === "details" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex gap-2 flex-wrap mb-3">
                  {doc.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Add tags (comma-separated)"
                    className="flex-1 border border-zinc-300 rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleAddTags}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">File</h3>
                <div className="flex gap-2">
                  <a
                    href={baseFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download Document
                  </a>
                  <span className="text-gray-400">|</span>
                  <a
                    href={baseFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in New Tab
                  </a>
                </div>

                <div className="mt-4">
                  {fileExt === "pdf" ? (
                    <iframe
                      src={baseFileUrl}
                      className="w-full h-[70vh] border border-zinc-200 rounded"
                    />
                  ) : fileExt === "png" ||
                    fileExt === "jpg" ||
                    fileExt === "jpeg" ||
                    fileExt === "gif" ||
                    fileExt === "webp" ? (
                    <img
                      src={baseFileUrl}
                      alt={doc?.title || "document"}
                      className="max-w-full border border-zinc-200 rounded"
                    />
                  ) : fileExt === "docx" ? (
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                        baseFileUrl
                      )}`}
                      className="w-full h-[70vh] border border-zinc-200 rounded"
                    />
                  ) : fileExt === "doc" ? (
                    <div className="text-sm text-zinc-600">
                      This document type can’t be previewed in-browser. Please use the download link.
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Upload New Version</h3>
                <form onSubmit={handleUploadVersion} className="flex gap-2">
                  <input
                    type="file"
                    required
                    className="flex-1 border border-zinc-300 rounded px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Upload
                  </button>
                </form>
              </div>

              {doc.approvalRequired && (
                <button
                  onClick={handleRequestApproval}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Request Approval
                </button>
              )}
            </div>
          )}

          {activeTab === "versions" && (
            <div>
              {versionHistory.length === 0 ? (
                <p className="text-gray-500">No version history</p>
              ) : (
                <div className="space-y-2">
                  {versionHistory.map((entry, idx) => (
                    <div
                      key={entry.version || idx}
                      className="border border-zinc-200 rounded p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Version {entry.version}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(entry.uploadedAt || entry.createdAt).toLocaleString()}
                          </p>
                          {entry.uploadedBy && (
                            <p className="text-xs text-gray-500">
                              by {entry.uploadedBy.name || entry.uploadedBy}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:4000"}${entry.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-blue-600 text-sm hover:bg-blue-50 rounded"
                          >
                            View
                          </a>
                          <button
                            onClick={async () => {
                              try {
                                await restoreDocumentVersion(docId, entry.version);
                                await alert("Version restored successfully", { title: "Success" });
                                fetchDocument();
                              } catch (err) {
                                await alert("Failed to restore", { title: "Error" });
                              }
                            }}
                            className="px-3 py-1 text-green-600 text-sm hover:bg-green-50 rounded"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "approvals" && (
            <div className="space-y-3">
              {approvals.length === 0 ? (
                <p className="text-gray-500">No approvals yet</p>
              ) : (
                approvals.map((approval) => (
                  <div
                    key={approval._id}
                    className="border border-zinc-200 rounded p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {approval.status === "pending" ? "Pending" : approval.status === "approved" ? "Approved" : "Rejected"}
                        </p>
                        {approval.assignee && (
                          <p className="text-xs text-gray-600">
                            Assignee: {approval.assignee.name || approval.assignee.email}
                          </p>
                        )}
                        {approval.requestedBy && (
                          <p className="text-xs text-gray-600">
                            Requested by: {approval.requestedBy.name}
                          </p>
                        )}
                        {approval.comment && (
                          <p className="text-sm mt-2 text-gray-700">{approval.comment}</p>
                        )}
                        {approval.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(approval.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border border-zinc-300 rounded px-3 py-2 text-sm"
                  rows={3}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add Comment
                </button>
              </form>

              <div className="space-y-3">
                {doc.comments?.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="border-l-4 border-blue-200 pl-3 py-2"
                  >
                    <p className="text-xs text-gray-600">{c.name}</p>
                    <p className="text-sm">{c.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <p className="text-gray-500">No audit logs</p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="border-l-4 border-gray-300 pl-3 py-2 text-sm"
                  >
                    <p className="font-medium">{log.action}</p>
                    {log.user && (
                      <p className="text-xs text-gray-600">
                        by {log.user.name || log.user.email}
                      </p>
                    )}
                    {log.changes && (
                      <p className="text-xs text-gray-500 mt-1">
                        Changes: {JSON.stringify(log.changes)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
