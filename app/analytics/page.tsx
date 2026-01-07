"use client";

import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { AnalyticsStats, getAnalyticsStats } from "../../lib/apiClient";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getAnalyticsStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const renderKeyValueList = (data?: Record<string, number>) => {
    if (!data) {
      return <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>;
    }
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>;
    }
    return (
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{key}</span>
            <Badge variant="default">{value}</Badge>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
        <div className="loader"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Analytics</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Comprehensive insights into your document management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Documents</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats?.totalDocuments || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Documents</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats?.activeDocuments || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Expiring Soon</p>
              <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats?.expiringSoon || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Storage Used</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats?.storageUsed || "0 GB"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Documents by Type
          </h2>
          {renderKeyValueList(stats?.byType)}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Documents by Department
          </h2>
          {renderKeyValueList(stats?.byDepartment)}
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Documents by Status
          </h2>
          {renderKeyValueList(stats?.byStatus)}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Approvals
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Approvals by Status</div>
              <div className="mt-3">{renderKeyValueList(stats?.approvalsByStatus)}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Decided (30d)</div>
                <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats?.approvalsDecidedLast30Days || 0}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Avg decision time</div>
                <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {typeof stats?.avgApprovalTimeHours === "number"
                    ? `${stats.avgApprovalTimeHours.toFixed(1)}h`
                    : "N/A"}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">P95 decision time</div>
                <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {typeof stats?.p95ApprovalTimeHours === "number"
                    ? `${stats.p95ApprovalTimeHours.toFixed(1)}h`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Documents Created (Last 30 Days)
          </h2>
          {stats?.docsCreatedLast30Days?.length ? (
            <div className="space-y-2">
              {stats.docsCreatedLast30Days.slice(-10).map((d) => (
                <div key={d.date} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">{d.date}</span>
                  <Badge variant="default">{d.count}</Badge>
                </div>
              ))}
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing last 10 days with activity.
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Top Tags
          </h2>
          {stats?.topTags?.length ? (
            <div className="space-y-3">
              {stats.topTags.map((t) => (
                <div key={t.tag} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{t.tag}</span>
                  <Badge variant="default">{t.count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
          )}
        </Card>
      </div>
    </div>
  );
}


