"use client";

import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Input from "../../components/Input";
import { useModal } from "../../components/ModalProvider";
import {
  getOrg,
  updateOrg,
  getZohoIntegrationStatus,
  ZohoIntegrationStatus,
} from "../../lib/apiClient";

interface Organization {
  _id: string;
  name: string;
  zoho?: {
    enabled?: boolean;
    creatorFormId?: string;
    webhookUrl?: string;
    workdriveFolderId?: string;
    signTemplateId?: string;
  };
}

export default function IntegrationsPage() {
  const { alert } = useModal();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingZoho, setEditingZoho] = useState(false);
  const [status, setStatus] = useState<ZohoIntegrationStatus | null>(null);
  const [zohoSettings, setZohoSettings] = useState({
    enabled: false,
    creatorFormId: "",
    webhookUrl: "",
    workdriveFolderId: "",
    signTemplateId: "",
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const organization: any = await getOrg();
      
      setOrg(organization);
      setZohoSettings({
        enabled: organization.zoho?.enabled || false,
        creatorFormId: organization.zoho?.creatorFormId || "",
        webhookUrl: organization.zoho?.webhookUrl || "",
        workdriveFolderId: organization.zoho?.workdriveFolderId || "",
        signTemplateId: organization.zoho?.signTemplateId || "",
      });

      try {
        const s = await getZohoIntegrationStatus();
        setStatus(s);
      } catch (e) {
        setStatus(null);
      }
    } catch (err) {
      console.error("Failed to load organization:", err);
      await alert("Failed to load organization settings", { title: "Error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveZoho = async () => {
    if (!org) return;
    try {
      setSaving(true);
      await updateOrg({ zoho: zohoSettings } as any);
      
      await alert("Zoho settings updated successfully", { title: "Success" });
      setEditingZoho(false);
      loadOrganization();
    } catch (err: any) {
      await alert(err.message || "Failed to save settings", { title: "Error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loader"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Integrations</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Connect external services to enhance your document management workflow
        </p>
      </div>

      {/* Zoho Integration Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Zoho Integration
                </h3>
                <Badge variant={zohoSettings.enabled ? "success" : "default"}>
                  {zohoSettings.enabled ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Connect Zoho Creator, WorkDrive, and Sign for seamless document workflows
              </p>
            </div>
            <Button
              size="sm"
              variant={editingZoho ? "outline" : "primary"}
              onClick={() => setEditingZoho(!editingZoho)}
            >
              {editingZoho ? "Cancel" : "Configure"}
            </Button>
          </div>

          {editingZoho && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={zohoSettings.enabled}
                  onChange={(e) =>
                    setZohoSettings({ ...zohoSettings, enabled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Enable Zoho Integration</label>
              </div>

              <Input
                label="Creator Form ID"
                value={zohoSettings.creatorFormId}
                onChange={(e) =>
                  setZohoSettings({ ...zohoSettings, creatorFormId: e.target.value })
                }
                placeholder="e.g., app-name/form-name"
                helperText="Format: {appName}/{formName}"
              />

              <Input
                label="WorkDrive Folder ID"
                value={zohoSettings.workdriveFolderId}
                onChange={(e) =>
                  setZohoSettings({ ...zohoSettings, workdriveFolderId: e.target.value })
                }
                placeholder="Folder ID from Zoho WorkDrive"
              />

              <Input
                label="Webhook URL"
                value={zohoSettings.webhookUrl}
                onChange={(e) =>
                  setZohoSettings({ ...zohoSettings, webhookUrl: e.target.value })
                }
                placeholder="https://your-webhook-url.com"
                helperText="Notifications for document uploads and approvals"
              />

              <Input
                label="Sign Template ID"
                value={zohoSettings.signTemplateId}
                onChange={(e) =>
                  setZohoSettings({ ...zohoSettings, signTemplateId: e.target.value })
                }
                placeholder="Template ID from Zoho Sign"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingZoho(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveZoho} loading={saving} loadingText="Saving...">
                  Save Settings
                </Button>
              </div>
            </div>
          )}

          {!editingZoho && zohoSettings.enabled && (
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Creator Form:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {zohoSettings.creatorFormId || "Not configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">WorkDrive Folder:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {zohoSettings.workdriveFolderId || "Not configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Webhook URL:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                  {zohoSettings.webhookUrl || "Not configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Sign Template:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {zohoSettings.signTemplateId || "Not configured"}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Integration Status */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Zoho Services Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Zoho Creator</span>
            <Badge variant={status?.enabled && zohoSettings.creatorFormId ? "success" : "default"}>
              {zohoSettings.creatorFormId ? "Configured" : "Not Configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Zoho WorkDrive</span>
            <Badge variant={status?.enabled && status?.hasWorkDriveFolder ? "success" : "default"}>
              {zohoSettings.workdriveFolderId ? "Configured" : "Not Configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Zoho Sign</span>
            <Badge variant={status?.enabled && status?.hasSignTemplate ? "success" : "default"}>
              {zohoSettings.signTemplateId ? "Configured" : "Not Configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Webhook Notifications</span>
            <Badge variant={status?.enabled && status?.hasWebhookUrl ? "success" : "default"}>
              {zohoSettings.webhookUrl ? "Configured" : "Not Configured"}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}


