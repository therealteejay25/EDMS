"use client";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import type { Comment } from "../data/mockData";

export default function CommentSection({ docId }: { docId: string }) {
  const [allComments, setAllComments] = useState<Comment[]>([]);

  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { getDocument } = await import("@/lib/apiClient");
        const result = await getDocument(docId);
        setAllComments(result.doc?.comments || []);
      } catch (err) {
        console.warn("Failed to load comments:", err);
      }
    };
    load();
  }, [docId]);

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    try {
      const { addDocumentComment, getDocument } = await import("@/lib/apiClient");
      await addDocumentComment(docId, text);
      // Reload comments from server
      const result = await getDocument(docId);
      setAllComments(result.doc?.comments || []);
      setText("");
      setAuthor("");
    } catch (err) {
      alert("Failed to add comment: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const count = allComments.length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium">Comments</h3>
        <div className="text-sm text-zinc-500">
          {count} comment{count !== 1 ? "s" : ""}
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-4 space-y-3">
        <input
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Your name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <textarea
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
          rows={4}
          placeholder="Add a comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit">Add comment</Button>
        </div>
      </form>

      <div className="space-y-3">
        {allComments.map((c: any, idx: number) => (
          <div
            key={c._id || idx}
            className="rounded-md border border-zinc-100 bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{c.name || c.author || "Anonymous"}</div>
              <div className="text-xs text-zinc-500">{c.date || new Date(c.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-2 text-sm text-zinc-700">{c.comment || c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
