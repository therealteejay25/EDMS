"use client";

import React, { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";

const integrations = [
  { id: "zoho-workdrive", name: "Zoho WorkDrive", status: "connected", description: "Cloud storage integration" },
  { id: "zoho-sign", name: "Zoho Sign", status: "available", description: "E-signature integration" },
  { id: "zoho-cliq", name: "Zoho Cliq", status: "available", description: "Notifications and alerts" },
  { id: "microsoft-365", name: "Microsoft 365", status: "disconnected", description: "SharePoint and OneDrive integration" },
  { id: "google-drive", name: "Google Drive", status: "disconnected", description: "Google Drive integration" },
  { id: "slack", name: "Slack", status: "disconnected", description: "Slack notifications" },
];

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    setConnecting(id);
    // Simulate connection
    setTimeout(() => {
      setConnecting(null);
    }, 2000);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "connected": return "success";
      case "available": return "default";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Integrations</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Connect external services to enhance your document management workflow
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {integration.name}
                  </h3>
                  <Badge variant={getStatusVariant(integration.status)}>
                    {integration.status}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {integration.description}
                </p>
              </div>
              <div className="ml-4">
                {integration.status === "connected" ? (
                  <Button variant="outline" size="sm">Disconnect</Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                    disabled={connecting === integration.id}
                  >
                    {connecting === integration.id ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


