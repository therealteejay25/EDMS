"use client";

import { useEffect, useState } from "react";
import { listDocuments } from "@/lib/apiClient";
import { documentStatusLabel, titleCase } from "@/lib/display";
import Link from "next/link";

interface DocumentListProps {
  filters?: Record<string, any>;
}

export default function DocumentList({ filters = {} }: DocumentListProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentFilters, setCurrentFilters] = useState(filters);

  useEffect(() => {
    setCurrentFilters(filters);
    setPage(1); // Reset to first page when filters change
  }, [filters]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await listDocuments({ ...currentFilters, page, limit: 20 });
        setDocuments(result.data || []);
        setTotal(result.total || 0);
      } catch (err) {
        console.error("Error loading documents:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load documents"
        );
        setDocuments([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [currentFilters, page]);

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    archived: "bg-gray-200 text-gray-700",
    expired: "bg-orange-100 text-orange-800",
  };

  if (loading)
    return <div className="text-center py-8">Loading documents...</div>;
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error}
      </div>
    );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-300 bg-zinc-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Title</th>
              <th className="text-left py-3 px-4 font-medium">Type</th>
              <th className="text-left py-3 px-4 font-medium">Department</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Version</th>
              <th className="text-left py-3 px-4 font-medium">Updated</th>
              <th className="text-left py-3 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc._id || doc.id}
                className="border-b border-zinc-200 hover:bg-zinc-50"
              >
                <td className="py-3 px-4">{doc.title}</td>
                <td className="py-3 px-4">{titleCase(doc.type)}</td>
                <td className="py-3 px-4">{doc.department}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${statusColor[doc.status] || "bg-gray-100"
                      }`}
                  >
                    {documentStatusLabel(doc.status)}
                  </span>
                </td>
                <td className="py-3 px-4">v{doc.version || 1}</td>
                <td className="py-3 px-4 text-xs text-gray-600">
                  {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/documents/${doc._id || doc.id}`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-500">No documents found</div>
      )}

      {total > 20 && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-zinc-300 rounded disabled:opacity-50 hover:bg-zinc-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / 20)} ({total} total)
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
            className="px-4 py-2 border border-zinc-300 rounded disabled:opacity-50 hover:bg-zinc-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
