"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import {
  listDocuments,
  getMyPendingApprovals,
  getCurrentUser,
  formatDateTime,
  Document,
} from "../../lib/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface Stats {
  totalDocuments: number;
  pendingApprovals: number;
  expiringSoon: number;
  storageUsed: string;
  recentActivity: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    pendingApprovals: 0,
    expiringSoon: 0,
    storageUsed: "0 GB",
    recentActivity: new Date().toLocaleDateString(),
  });
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load user
        const userData = await getCurrentUser().catch(() => null);
        setUser(userData);

        // Load documents
        const docsRes = await listDocuments({
          limit: 5,
          page: 1,
        }).catch(() => ({ data: [], total: 0 }));
        setRecentDocs(docsRes.data || []);

        // Load pending approvals
        const approvals = await getMyPendingApprovals().catch(() => []);
        setPendingApprovals(Array.isArray(approvals) ? approvals : []);

        // Load stats from API
        try {
          const statsRes = await fetch(`${API_URL}/stats`, {
            credentials: "include",
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats({
              totalDocuments: statsData.totalDocuments || docsRes.total || 0,
              pendingApprovals: approvals.length,
              expiringSoon: statsData.expiringSoon || 0,
              storageUsed: statsData.storageUsed || "0 GB",
              recentActivity: new Date().toLocaleDateString(),
            });
          } else {
            setStats({
              totalDocuments: docsRes.total || 0,
              pendingApprovals: approvals.length,
              expiringSoon: 0,
              storageUsed: "0 GB",
              recentActivity: new Date().toLocaleDateString(),
            });
          }
        } catch (e) {
          setStats({
            totalDocuments: docsRes.total || 0,
            pendingApprovals: approvals.length,
            expiringSoon: 0,
            storageUsed: "0 GB",
            recentActivity: new Date().toLocaleDateString(),
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loader"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const isDeptLead = user?.role === "department_lead";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isAdmin
            ? "System Administrator"
            : isDeptLead
            ? "Department Lead"
            : "User"}{" "}
          • {user?.department || "General"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Documents
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats.totalDocuments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30">
              <svg
                className="h-6 w-6 text-primary-600 dark:text-primary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Pending Approvals
              </p>
              <p className="mt-2 text-3xl font-bold text-primary-600 dark:text-primary-400">
                {stats.pendingApprovals}
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <svg
                className="h-6 w-6 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Expiring Soon
              </p>
              <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.expiringSoon}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
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
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Storage Used
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats.storageUsed}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push("/upload")}>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload Document
          </Button>
          <Button variant="outline" onClick={() => router.push("/documents")}>
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View All Documents
          </Button>
          {stats.pendingApprovals > 0 && (
            <Button variant="outline" onClick={() => router.push("/approvals")}>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Review Approvals ({stats.pendingApprovals})
            </Button>
          )}
          {(isAdmin || isDeptLead) && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push("/workflows")}
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Manage Workflows
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/analytics")}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                View Analytics
              </Button>
            </>
          )}
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Documents */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Documents
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/documents")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentDocs.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                No documents yet
              </p>
            ) : (
              recentDocs.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-start justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/documents/${doc._id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {doc.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        {doc.type}
                      </Badge>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(doc.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={doc.status === "active" ? "success" : "default"}
                    className="ml-2"
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Pending Approvals
            </h2>
            {pendingApprovals.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/approvals")}
              >
                View All
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                No pending approvals
              </p>
            ) : (
              pendingApprovals.slice(0, 5).map((approval) => (
                <div
                  key={approval._id || approval.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  onClick={() => {
                    const docId =
                      typeof approval.docId === "string"
                        ? approval.docId
                        : (approval.docId as any)?._id || approval.docId;
                    if (docId) {
                      router.push(`/documents/${docId}`);
                    } else {
                      router.push("/approvals");
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                      {approval.requestedBy?.name ||
                        approval.docId?.title ||
                        "Document"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {approval.createdAt
                        ? formatDateTime(approval.createdAt)
                        : "Recently"}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
