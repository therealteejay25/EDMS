"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Badge from "../../../components/Badge";
import Input from "../../../components/Input";
import Textarea from "../../../components/Textarea";
import { useModal } from "../../../components/ModalProvider";
import {
  getDocument,
  addDocumentComment,
  addDocumentTag,
  archiveDocument,
  setDocumentLegalHold,
  uploadDocumentVersion,
  restoreDocumentVersion,
  requestDocumentApproval,
  Document,
  formatDateTime,
  getBadgeVariant,
  getCurrentUser,
} from "../../../lib/apiClient";
import { documentStatusLabel, roleLabel, titleCase } from "../../../lib/display";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:4000";

export default function DocumentDetailPage() {
  const { alert, confirm } = useModal();
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [doc, setDoc] = useState<Document | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "versions" | "comments" | "activity" | "approvals"
  >("details");
  const [newComment, setNewComment] = useState("");
  const [newTag, setNewTag] = useState("");
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [requestingApproval, setRequestingApproval] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [docData, userData] = await Promise.all([
        getDocument(docId),
        getCurrentUser().catch(() => null),
      ]);
      setDoc(docData.doc);
      setUser(userData);
    } catch (err) {
      setError(err.message || "Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [docId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addDocumentComment(docId, newComment);
      setNewComment("");
      loadData();
    } catch (err) {
      await alert(err.message || "Failed to add comment", { title: "Error" });
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !doc) return;

    try {
      const tags = [...(doc.tags || []), newTag.trim()];
      await addDocumentTag(docId, tags);
      setNewTag("");
      loadData();
    } catch (err) {
      await alert(err.message || "Failed to add tag", { title: "Error" });
    }
  };

  const handleArchive = async () => {
    const ok = await confirm("Are you sure you want to archive this document?", {
      title: "Confirm",
      confirmText: "Archive",
      cancelText: "Cancel",
    });
    if (!ok) return;
    try {
      await archiveDocument(docId);
      loadData();
    } catch (err) {
      await alert(err.message || "Failed to archive document", { title: "Error" });
    }
  };

  const handleLegalHold = async (hold: boolean) => {
    try {
      await setDocumentLegalHold(docId, hold);
      loadData();
    } catch (err) {
      await alert(err.message || "Failed to update legal hold", { title: "Error" });
    }
  };

  const handleUploadVersion = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVersion(true);
      const form = new FormData();
      form.append("file", file);
      await uploadDocumentVersion(docId, form);
      loadData();
      await alert("New version uploaded successfully", { title: "Success" });
    } catch (err) {
      await alert(err.message || "Failed to upload version", { title: "Error" });
    } finally {
      setUploadingVersion(false);
      e.target.value = "";
    }
  };

  const handleRestoreVersion = async (version: number) => {
    const ok = await confirm(
      `Restore version ${version}? This will create a new version.`,
      {
        title: "Confirm",
        confirmText: "Restore",
        cancelText: "Cancel",
      }
    );
    if (!ok) return;
    try {
      await restoreDocumentVersion(docId, version);
      loadData();
    } catch (err) {
      await alert(err.message || "Failed to restore version", { title: "Error" });
    }
  };

  const handleRequestApproval = async () => {
    if (!user) return;
    const assignee = prompt("Assign approval to (email or user ID):");
    if (!assignee) return;

    try {
      setRequestingApproval(true);
      await requestDocumentApproval(docId, assignee);
      await alert("Approval requested successfully", { title: "Success" });
      loadData();
    } catch (err) {
      const error = err as Error;
      await alert(error.message || "Failed to request approval", { title: "Error" });
    } finally {
      setRequestingApproval(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loader"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          {error || "Document not found"}
        </p>
        <Button className="mt-4" onClick={() => router.push("/documents")}>
          Back to Documents
        </Button>
      </div>
    );
  }

  const canEdit =
    user?.role === "admin" ||
    user?.role === "department_lead" ||
    user?._id === doc.owner?._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/documents")}
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {doc.title}
              </h1>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant={getBadgeVariant(doc.status)}>
                  {documentStatusLabel(doc.status)}
                </Badge>
                {doc.legalHold && <Badge variant="danger">Legal Hold</Badge>}
                {doc.approvalRequired && (
                  <Badge variant="warning">Approval Required</Badge>
                )}
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  v{doc.version}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              {doc.status !== "archived" && (
                <Button variant="outline" onClick={handleArchive}>
                  Archive
                </Button>
              )}
              <Button
                variant={doc.legalHold ? "secondary" : "outline"}
                onClick={() => handleLegalHold(!doc.legalHold)}
              >
                {doc.legalHold ? "Release Legal Hold" : "Set Legal Hold"}
              </Button>
              {!doc.approvalRequired && (
                <Button
                  variant="outline"
                  onClick={handleRequestApproval}
                  loading={requestingApproval}
                  loadingText="Requesting..."
                >
                  Request Approval
                </Button>
              )}
            </>
          )}
          <a
            href={`${API_URL}${doc.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-700">
        <nav className="flex space-x-8">
          {([
            "details",
            "versions",
            "comments",
            "activity",
            "approvals",
          ] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Document Preview */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">Document Preview</h2>
                <div
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                  style={{ height: "600px" }}
                >
                  <iframe
                    src={`${API_URL}${doc.fileUrl}`}
                    className="w-full h-full rounded-lg"
                    title="Document preview"
                  />
                </div>
              </Card>

              {/* Metadata */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">Metadata</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Type
                    </label>
                    <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                      {doc.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Department
                    </label>
                    <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                      {doc.department}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Owner
                    </label>
                    <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                      {doc.owner?.name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Version
                    </label>
                    <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                      v{doc.version}
                    </p>
                  </div>
                  {doc.effectiveDate && (
                    <div>
                      <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Effective Date
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                        {formatDateTime(doc.effectiveDate)}
                      </p>
                    </div>
                  )}
                  {doc.expiryDate && (
                    <div>
                      <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Expiry Date
                      </label>
                      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                        {formatDateTime(doc.expiryDate)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Tags */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.tags && doc.tags.length > 0 ? (
                    doc.tags.map((tag, idx) => (
                      <Badge key={idx} variant="default">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      No tags
                    </p>
                  )}
                </div>
                {canEdit && (
                  <form onSubmit={handleAddTag} className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      className="flex-1"
                    />
                    <Button type="submit" size="sm">
                      Add
                    </Button>
                  </form>
                )}
              </Card>

              {/* Quick Info */}
              <Card>
                <h2 className="text-lg font-semibold mb-4">Quick Info</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-zinc-500 dark:text-zinc-400">
                      Created
                    </label>
                    <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                      {formatDateTime(doc.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-zinc-500 dark:text-zinc-400">
                      Last Updated
                    </label>
                    <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                      {formatDateTime(doc.updatedAt)}
                    </p>
                  </div>
                  {doc.retentionYears && (
                    <div>
                      <label className="text-zinc-500 dark:text-zinc-400">
                        Retention
                      </label>
                      <p className="mt-1 text-zinc-900 dark:text-zinc-100">
                        {doc.retentionYears} years
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "versions" && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Version History</h2>
              {canEdit && (
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleUploadVersion}
                    disabled={uploadingVersion}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    as="span"
                    loading={uploadingVersion}
                    loadingText="Uploading..."
                  >
                    Upload New Version
                  </Button>
                </label>
              )}
            </div>
            <div className="space-y-4">
              {/* Current Version */}
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-primary-700 dark:text-primary-300 font-semibold">
                      v{doc.version}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      Current Version
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(doc.updatedAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={`${API_URL}${doc.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  View
                </a>
              </div>

              {/* Historical Versions */}
              {doc.history && doc.history.length > 0 ? (
                doc.history.map((version, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                          v{version.version}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          Version {version.version}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {formatDateTime(version.uploadedAt)} •{" "}
                          {version.uploadedBy?.name || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`${API_URL}${version.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                      >
                        View
                      </a>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreVersion(version.version)}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  No version history
                </p>
              )}
            </div>
          </Card>
        )}

        {activeTab === "comments" && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <div className="space-y-4 mb-6">
              {doc.comments && doc.comments.length > 0 ? (
                doc.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {comment.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {comment.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  No comments yet
                </p>
              )}
            </div>
            <form onSubmit={handleAddComment} className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <Button type="submit">Add Comment</Button>
            </form>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
            <div className="space-y-3">
              {doc.activity && doc.activity.length > 0 ? (
                doc.activity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <svg
                        className="h-4 w-4 text-primary-600 dark:text-primary-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">
                        {activity.action}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {activity.details}
                        </p>
                      )}
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  No activity recorded
                </p>
              )}
            </div>
          </Card>
        )}

        {activeTab === "approvals" && (
          <Card>
            <h2 className="text-lg font-semibold mb-4">Approvals</h2>
            <div className="space-y-4">
              {/* Approval status will be loaded here */}
              <p className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                Approval information will be displayed here
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
