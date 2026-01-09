"use client";

import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { listAuditLogs, exportAuditLog, AuditLog, formatDateTime } from "../../lib/apiClient";
import { useModal } from "../../components/ModalProvider";
import { auditActionLabel, shortId, titleCase } from "../../lib/display";

export default function AuditPage() {
  const { alert } = useModal();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await listAuditLogs({ page });
        setLogs(Array.isArray(result?.data) ? result.data : []);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
        setLogs([]); // Ensure logs is an array even on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportAuditLog();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      await alert("Failed to export audit log", { title: "Error" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Audit Log</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Complete audit trail of all system activities
          </p>
        </div>
        <Button onClick={handleExport} loading={exporting} loadingText="Exporting...">
          Export CSV
        </Button>
      </div>

      <Card padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                      Resource
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {log.user?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                        {auditActionLabel(log.action)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {titleCase(log.resource)} {shortId(log.resourceId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}


