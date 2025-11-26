"use client";
import React, { useMemo, useState, useEffect } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function DocumentsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${API}/api/documents`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const json = await res.json();
        setData(json.data || []);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (type && d.type !== type) return false;
      if (dept && d.department !== dept) return false;
      if (status && d.status !== status) return false;
      return true;
    });
  }, [q, type, dept, status, data]);

  const columns = [
    { key: "title", label: "Title" },
    { key: "type", label: "Type" },
    { key: "department", label: "Department" },
    { key: "status", label: "Status" },
    { key: "version", label: "Version" },
    { key: "dateAdded", label: "Date Added" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <div className="flex gap-2">
          <Button onClick={() => alert("Export (mock)")}>Export</Button>
        </div>
      </div>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by title"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
            <label className="flex flex-col text-sm">
              <span>Type</span>
              <select
                className="rounded-md border border-zinc-200 px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All</option>
                <option>Policy</option>
                <option>Procedure</option>
                <option>Standard</option>
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span>Department</span>
              <select
                className="rounded-md border border-zinc-200 px-3 py-2"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              >
                <option value="">All</option>
                <option>Legal</option>
                <option>HR</option>
                <option>IT</option>
                <option>Finance</option>
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span>Status</span>
              <select
                className="rounded-md border border-zinc-200 px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option>Draft</option>
                <option>Active</option>
                <option>Pending</option>
              </select>
            </label>
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={filtered}
        renderRowActions={(row) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => window.location.assign(`/documents/${row.id}`)}
            >
              View
            </Button>
          </div>
        )}
      />
    </div>
  );
}
