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
        const API = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${API}/api/documents/${docId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const json = await res.json();
        setAllComments(json.doc?.comments || []);
      } catch (err) {
        // ignore
      }
    };
    load();
  }, [docId]);

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API}/api/documents/${docId}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text }),
      });
      if (!res.ok) throw new Error("Failed");
      // reload comments
      const json = await res.json().catch(() => null);
      // optimistic update: push new comment locally
      setAllComments((s) => [
        {
          userId: "me",
          name: author || "Me",
          comment: text,
          createdAt: new Date().toISOString(),
        } as any,
        ...s,
      ]);
      setText("");
      setAuthor("");
    } catch (err) {
      alert("Failed to add comment");
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
        {allComments.map((c) => (
          <div
            key={c.id}
            className="rounded-md border border-zinc-100 bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{c.author}</div>
              <div className="text-xs text-zinc-500">{c.date}</div>
            </div>
            <div className="mt-2 text-sm text-zinc-700">{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
