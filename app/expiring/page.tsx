"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { listDocuments, Document, formatDateTime } from "../../lib/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ExpiringPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Load expiring documents from API
        const res = await fetch(`${API_URL}/expiry/soon`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        } else {
          // Fallback: filter documents with expiry dates
          const result = await listDocuments({ limit: 100 });
          const expiring = (result.data || []).filter(
            (doc) =>
              doc.expiryDate &&
              new Date(doc.expiryDate) <=
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          );
          setDocuments(expiring);
        }
      } catch (err) {
        console.error("Failed to load expiring documents:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getDaysUntilExpiry = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Expiring Documents
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Documents expiring within the next 30 days
        </p>
      </div>

      {loading ? (
        <Card>
          <div className="p-12 text-center">
          <div className="loader"></div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Loading...
            </p>
          </div>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              No documents expiring soon
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => {
            const daysLeft = doc.expiryDate
              ? getDaysUntilExpiry(doc.expiryDate)
              : 0;
            return (
              <Card key={doc._id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {doc.title}
                      </h3>
                      <Badge
                        variant={
                          daysLeft <= 7
                            ? "danger"
                            : daysLeft <= 14
                            ? "warning"
                            : "default"
                        }
                      >
                        {daysLeft} days left
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.department}</span>
                      <span>•</span>
                      <span>
                        Expires:{" "}
                        {doc.expiryDate
                          ? formatDateTime(doc.expiryDate)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/documents/${doc._id}`)}
                  >
                    View
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
