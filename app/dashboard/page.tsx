import React from "react";
import Card from "../../components/Card";
import { stats } from "../../data/mockData";

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="flex-1">
      <div className="text-sm text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <StatCard title="Total documents" value={stats.totalDocuments} />
        <StatCard title="Pending approvals" value={stats.pendingApprovals} />
        <StatCard title="Active policies" value={stats.activePolicies} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg font-medium">Recent documents</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Quick glance of recently added documents.
          </p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium">Approvals</h3>
          <p className="mt-2 text-sm text-zinc-600">
            Recent approval requests and activity.
          </p>
        </Card>
      </div>
    </div>
  );
}
