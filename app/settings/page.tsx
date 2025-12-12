"use client";
import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Badge from "../../components/Badge";
import { getCurrentUser, logout, formatDateTime } from "../../lib/apiClient";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [approvalNotifications, setApprovalNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  if (loading)
    return <div className="p-4 text-center"><div className="loader"></div>Loading settings...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {saved && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
          ✓ Settings saved successfully
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">Profile</h2>
          <div className="space-y-4">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                {user?.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Name</p>
              <p className="font-semibold">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Email</p>
              <p className="break-all text-sm">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Role</p>
              <div className="mt-1">
                <Badge
                  variant={
                    user?.role === "admin"
                      ? "success"
                      : user?.role === "department_lead"
                      ? "warning"
                      : "default"
                  }
                >
                  {user?.role === "admin"
                    ? "Administrator"
                    : user?.role === "department_lead"
                    ? "Department Lead"
                    : "User"}
                </Badge>
              </div>
            </div>
            {user?.department && (
              <div>
                <p className="text-xs text-zinc-600">Department</p>
                <p className="text-sm">{user.department}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Preferences */}
        <Card className="md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-semibold">Theme</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="rounded-md border border-zinc-200 px-3 py-2"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </label>
            </div>

            <div className="border-t border-zinc-200 pt-4">
              <h3 className="mb-3 font-semibold">Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">
                    Email notifications for new documents
                  </span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={approvalNotifications}
                    onChange={(e) => setApprovalNotifications(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">
                    Notify me of approval requests
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-4">
              <Button onClick={handleSaveSettings} className="w-full">
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Security */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Password</p>
              <p className="text-sm text-zinc-600">
                Last changed{" "}
                {new Date(
                  Date.now() - 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Two-Factor Authentication</p>
                <p className="text-sm text-zinc-600">
                  Add an extra layer of security
                </p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Active Sessions</p>
                <p className="text-sm text-zinc-600">1 active session</p>
              </div>
              <Button variant="outline">Manage Sessions</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-red-600">Danger Zone</h2>
        <div className="space-y-3">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full"
          >
            Logout
          </Button>
          <Button variant="outline" className="w-full" disabled>
            Delete Account (Contact Admin)
          </Button>
        </div>
      </Card>
    </div>
  );
}
