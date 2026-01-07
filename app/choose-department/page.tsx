"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Select from "../../components/Select";
import { getCurrentUser, listDepartments, setMyDepartment } from "../../lib/apiClient";

export default function ChooseDepartmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = await getCurrentUser();
        if (!user) {
          router.push("/login");
          return;
        }

        if (user.role === "admin") {
          router.push("/dashboard");
          return;
        }

        if (user.department) {
          router.push("/dashboard");
          return;
        }

        const depts = await listDepartments();
        setDepartments(depts);
        if (depts.length > 0) setSelected(depts[0]);
      } catch (e: any) {
        setError(e?.message || "Failed to load departments");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const options = useMemo(
    () => departments.map((d) => ({ value: d, label: d })),
    [departments]
  );

  const handleSave = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      setError(null);
      await setMyDepartment(selected);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Choose your department</h1>
        <p className="mt-2 text-sm text-zinc-600">
          You need to select a department before you can access documents.
        </p>

        {loading ? (
          <div className="mt-6 text-sm text-zinc-600"><div className="loader"></div>Loading...</div>
        ) : (
          <div className="mt-6 space-y-4">
            {error ? (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <Select
              label="Department"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              options={options}
            />

            <Button
              onClick={handleSave}
              disabled={saving || !selected || departments.length === 0}
              className="w-full"
            >
              {saving ? "Saving..." : "Continue"}
            </Button>

            {departments.length === 0 ? (
              <p className="text-xs text-zinc-500">
                No departments configured yet. Ask an admin to create at least one
                department.
              </p>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
