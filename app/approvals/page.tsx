"use client";
import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";

export default function ApprovalsPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${API}/api/approvals?status=pending`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const json = await res.json();
        setRows(json.data || []);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const columns = [
    { key: "docId", label: "Doc ID" },
    { key: "requestedBy", label: "Requested By" },
    { key: "requestedAt", label: "Date" },
    { key: "status", label: "Status" },
  ];

  const approve = async (id: string) => {
    const API = process.env.NEXT_PUBLIC_API_URL || "";
    await fetch(`${API}/api/approvals/${id}/approve`, {
      method: "POST",
      credentials: "include",
    });
    setRows((r) => r.filter((x) => x._id !== id));
  };

  const reject = async (id: string) => {
    const API = process.env.NEXT_PUBLIC_API_URL || "";
    await fetch(`${API}/api/approvals/${id}/reject`, {
      method: "POST",
      credentials: "include",
    });
    setRows((r) => r.filter((x) => x._id !== id));
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Approvals</h1>
      </div>

      <Card>
        <Table
          columns={columns}
          data={rows}
          renderRowActions={(row: any) => (
            <div className="flex gap-2">
              <Button onClick={() => approve(row._id)} className="">
                Approve
              </Button>
              <Button variant="ghost" onClick={() => reject(row._id)}>
                Reject
              </Button>
            </div>
          )}
        />
      </Card>
    </div>
  );
}
