"use client"
import React, { useEffect, useState } from "react";
import Card from "../../../components/Card";
import Badge from "../../../components/Badge";
import CommentSection from "../../../components/CommentSection";
import { useParams } from 'next/navigation';


// type Props = { params: { id: string } };

export default function DocumentDetails() {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  useEffect(() => {
    const load = async () => {
      try {
        
        const API = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${API}/api/documents/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const json = await res.json();
        setDoc(json.doc);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!doc) return <div>Not found</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{doc.title}</h1>
        <Badge
          color={
            doc.status === "approved"
              ? "green"
              : doc.status === "draft"
              ? "yellow"
              : "gray"
          }
        >
          {doc.status}
        </Badge>
      </div>

      <Card className="mb-6">
        <h3 className="text-lg font-medium">Metadata</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <div>
            <div className="text-sm text-zinc-500">Type</div>
            <div className="mt-1 font-medium">{doc.type}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">Department</div>
            <div className="mt-1 font-medium">{doc.department}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">Version</div>
            <div className="mt-1 font-medium">{doc.version}</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-zinc-700">{doc.description}</div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <h3 className="text-lg font-medium">Preview</h3>
          <div className="mt-4 h-96 w-full rounded-md border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500">
            {doc.fileUrl ? (
              <iframe src={doc.fileUrl} className="h-full w-full" />
            ) : (
              <div>PDF preview (not available)</div>
            )}
            <div className="mt-3 text-xs text-zinc-500">
              (PDF viewer uses backend-served file URL)
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium">Version History</h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700">
            {doc.history && doc.history.length ? (
              doc.history.map((h: any, i: number) => (
                <li key={i}>
                  {h.version} — {new Date(h.uploadedAt).toLocaleDateString()} —{" "}
                  <a className="text-sky-600" href={h.fileUrl}>
                    view
                  </a>
                </li>
              ))
            ) : (
              <li>No history</li>
            )}
          </ul>

          <div className="mt-4">
            <label className="rounded-md bg-sky-600 px-3 py-2 text-sm text-white cursor-pointer">
              Upload New Version
              <input
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const f = e.currentTarget.files?.[0];
                  if (!f) return;
                  const form = new FormData();
                  form.append("file", f);
                  const API = process.env.NEXT_PUBLIC_API_URL || "";
                  const res = await fetch(
                    `${API}/api/documents/${id}/version`,
                    { method: "POST", body: form, credentials: "include" }
                  );
                  if (res.ok) {
                    alert("Uploaded new version");
                    location.reload();
                  } else {
                    alert("Upload failed");
                  }
                }}
              />
            </label>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CommentSection docId={id} />
        </Card>
      </div>
    </div>
  );
}
