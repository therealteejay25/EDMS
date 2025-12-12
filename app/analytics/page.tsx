"use client";

import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Badge from "../../components/Badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${API_URL}/stats`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

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
          <div className="space-y-3">
            {stats?.byType ? (
              Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{type}</span>
                  <Badge variant="default">{count as number}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Documents by Department
          </h2>
          <div className="space-y-3">
            {stats?.byDepartment ? (
              Object.entries(stats.byDepartment).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{dept}</span>
                  <Badge variant="default">{count as number}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}


