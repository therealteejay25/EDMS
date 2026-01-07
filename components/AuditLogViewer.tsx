"use client";

import { useState } from "react";
import * as AuditService from "@/lib/auditService";
import Button from "@/components/Button";
import { useModal } from "@/components/ModalProvider";

export default function AuditLogViewer() {
  const { alert } = useModal();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    resource: "",
    action: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await AuditService.getAuditLog(filters);
      setLogs(result.logs);
    } catch (err) {
      await alert(err instanceof Error ? err.message : "Failed to load audit logs", {
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await AuditService.exportAuditLog(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      await alert(err instanceof Error ? err.message : "Failed to export logs", {
        title: "Error",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <h3 className="font-medium mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <input
            type="text"
            name="action"
            placeholder="Action"
            value={filters.action}
            onChange={handleFilterChange}
            className="border border-zinc-300 rounded px-2 py-1 text-sm"
          />
          <select
            name="resource"
            value={filters.resource}
            onChange={handleFilterChange}
            className="border border-zinc-300 rounded px-2 py-1 text-sm"
          >
            <option value="">All Resources</option>
            <option value="document">Document</option>
            <option value="approval">Approval</option>
            <option value="workflow">Workflow</option>
          </select>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            className="border border-zinc-300 rounded px-2 py-1 text-sm"
          />
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            className="border border-zinc-300 rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} loading={loading} loadingText="Searching...">
            Search
          </Button>
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <h3 className="font-medium mb-3">Audit Log</h3>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? "Searching..." : "No logs found. Use filters to search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-300 bg-zinc-50">
                <tr>
                  <th className="text-left py-2 px-3 font-medium">Date</th>
                  <th className="text-left py-2 px-3 font-medium">User</th>
                  <th className="text-left py-2 px-3 font-medium">Action</th>
                  <th className="text-left py-2 px-3 font-medium">Resource</th>
                  <th className="text-left py-2 px-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-zinc-200">
                    <td className="py-2 px-3">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-3">{log.user?.email || "System"}</td>
                    <td className="py-2 px-3 font-medium">{log.action}</td>
                    <td className="py-2 px-3">{log.resource}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">
                      {JSON.stringify(log.changes || {}).slice(0, 50)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
