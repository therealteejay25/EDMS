"use client";
import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useRouter } from "next/navigation";
import { listAuthOrgs } from "../../lib/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<Array<{ _id: string; name: string }>>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [newOrgName, setNewOrgName] = useState<string>("");

  useEffect(() => {
    // check session with backend
    const check = async () => {
      try {
        const API =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        const res = await fetch(`${API}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          const user = data?.user || data;
          if (user && user.role !== "admin" && !user.department) {
            router.push("/choose-department");
            return;
          }
          router.push("/dashboard");
        }
      } catch (e) {
        // ignore
      }
    };
    check();
  }, [router]);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const data = await listAuthOrgs();
        setOrgs(data);
        if (data.length && !selectedOrgId) {
          setSelectedOrgId(data[0]._id);
        }
      } catch (e) {
        // ignore
      }
    };
    loadOrgs();
  }, [selectedOrgId]);

  function startZoho() {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const orgName = newOrgName.trim();
    const qs = new URLSearchParams();
    if (orgName) {
      qs.set("orgName", orgName);
    } else if (selectedOrgId) {
      qs.set("orgId", selectedOrgId);
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    window.location.assign(`${API}/auth/zoho/start${suffix}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <h2 className="mb-2 text-2xl font-semibold">Sign in to EDMS</h2>
        <div className="flex flex-col gap-8">
          <div className="text-sm text-zinc-600">
            Sign in using Zoho SSO for your organization.
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-zinc-700">
              Organization
            </div>
            <select
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              value={selectedOrgId}
              onChange={(e) => {
                setSelectedOrgId(e.target.value);
                setNewOrgName("");
              }}
            >
              {orgs.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-zinc-500">Or create a new org</div>
            <input
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              placeholder="New organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
          </div>
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          <div className="flex w-full">
            <Button className="bg-orange-500 py-3.5 w-full" onClick={startZoho}>Sign in with Zoho</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
