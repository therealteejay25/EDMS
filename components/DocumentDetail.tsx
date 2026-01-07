"use client";
import React, { useEffect, useState, useCallback } from "react";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import Input from "./Input";
import { useModal } from "./ModalProvider";

interface Document {
  _id: string;
  title: string;
  type: string;
  department: string;
  status: string;
  owner: { _id: string; name: string; email: string };
  fileUrl: string;
  version: number;
  tags: string[];
  legalHold: boolean;
  approvalRequired: boolean;
  approvalChain: string[];
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

interface DocumentDetailProps {
  docId: string;
  onUpdate?: () => void;
}

export default function DocumentDetail({
  docId,
  onUpdate,
}: DocumentDetailProps) {
  const { alert, confirm } = useModal();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "details" | "versions" | "comments" | "activity" | "approvals"
  >("details");
  const [newComment, setNewComment] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSettingLegalHold, setIsSettingLegalHold] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const loadDocument = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/documents/${docId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load document");
      const data = await res.json();
      setDoc(data.doc);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [docId, API]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API}/documents/${docId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add comment");
      setNewComment("");
      loadDocument();
    } catch (err) {
      await alert("Error: " + err.message, { title: "Error" });
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const res = await fetch(`${API}/documents/${docId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: [...(doc?.tags || []), newTag] }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add tag");
      setNewTag("");
      loadDocument();
    } catch (err) {
      await alert("Error: " + err.message, { title: "Error" });
    }
  };

  const handleArchive = async () => {
    const ok = await confirm("Archive this document?", {
      title: "Confirm",
      confirmText: "Archive",
      cancelText: "Cancel",
    });
    if (!ok) return;
    setIsArchiving(true);

    try {
      const res = await fetch(`${API}/documents/${docId}/archive`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to archive");
      await alert("Document archived", { title: "Success" });
      onUpdate?.();
      loadDocument();
    } catch (err) {
      await alert("Error: " + err.message, { title: "Error" });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSetLegalHold = async () => {
    setIsSettingLegalHold(true);
    try {
      const res = await fetch(`${API}/documents/${docId}/legal-hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hold: !doc?.legalHold }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update legal hold");
      loadDocument();
    } catch (err) {
      await alert("Error: " + err.message, { title: "Error" });
    } finally {
      setIsSettingLegalHold(false);
    }
  };

  const handleRestoreVersion = async (version: number) => {
    const ok = await confirm(`Restore version ${version}?`, {
      title: "Confirm",
      confirmText: "Restore",
      cancelText: "Cancel",
    });
    if (!ok) return;

    try {
      const res = await fetch(`${API}/documents/${docId}/restore-version`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to restore version");
      await alert("Version restored", { title: "Success" });
      loadDocument();
    } catch (err) {
      await alert("Error: " + err.message, { title: "Error" });
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!doc) return <div className="p-4">Document not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{doc.title}</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Version {doc.version} • {doc.type} • {doc.department}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={doc.status === "active" ? "success" : "default"}>
              {doc.status}
            </Badge>
            {doc.legalHold && <Badge variant="warning">Legal Hold</Badge>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {doc.tags.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const link = document.createElement("a");
              link.href = doc.fileUrl;
              link.download = doc.title;
              link.click();
            }}
          >
            Download
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open(`/documents/${docId}/detail#approvals`, "_self")
            }
          >
            Request Approval
          </Button>
          <Button
            variant="outline"
            onClick={handleSetLegalHold}
            disabled={isSettingLegalHold}
          >
            {doc.legalHold ? "Remove Legal Hold" : "Set Legal Hold"}
          </Button>
          <Button
            variant="danger"
            onClick={handleArchive}
            disabled={isArchiving || doc.status === "archived"}
          >
            Archive
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-4">
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
              className={`pb-3 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "details" && (
          <Card>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-600">Owner</p>
                  <p className="mt-1">{doc.owner.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600">Type</p>
                  <p className="mt-1">{doc.type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600">
                    Department
                  </p>
                  <p className="mt-1">{doc.department}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600">Status</p>
                  <p className="mt-1">{doc.status}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600">Created</p>
                  <p className="mt-1">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600">Updated</p>
                  <p className="mt-1">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Add Tag</h3>
                <form onSubmit={handleAddTag} className="mt-2 flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag"
                  />
                  <Button type="submit">Add</Button>
                </form>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "versions" && (
          <Card>
            <div className="space-y-3">
              {doc.history.map((hist) => (
                <div
                  key={hist.version}
                  className="flex items-center justify-between border-b border-zinc-200 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-semibold">Version {hist.version}</p>
                    <p className="text-xs text-zinc-600">
                      {new Date(hist.uploadedAt).toLocaleString()} by{" "}
                      {hist.uploadedBy.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = hist.fileUrl;
                        link.download = `${doc.title} v${hist.version}`;
                        link.click();
                      }}
                    >
                      Download
                    </Button>
                    {hist.version !== doc.version && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreVersion(hist.version)}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "comments" && (
          <Card>
            <div className="space-y-4">
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
                />
                <Button type="submit">Post Comment</Button>
              </form>

              <div className="space-y-3 border-t border-zinc-200 pt-4">
                {doc.comments.map((comment, idx) => (
                  <div key={idx} className="rounded-md bg-zinc-50 p-3">
                    <p className="text-sm font-semibold">{comment.name}</p>
                    <p className="mt-1 text-sm text-zinc-700">
                      {comment.comment}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card>
            <div className="space-y-3">
              {doc.activity.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 border-b border-zinc-200 pb-3 last:border-0"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{act.action}</span>
                      {act.details && ` - ${act.details}`}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(act.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "approvals" && (
          <Card>
            <div className="text-center py-8">
              <p className="text-sm text-zinc-600">Approval management</p>
              <Button className="mt-4">Request Approval</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
