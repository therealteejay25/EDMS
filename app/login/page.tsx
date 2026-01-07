"use client";
import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  function startZoho() {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    window.location.assign(`${API}/auth/zoho/start`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <h2 className="mb-2 text-2xl font-semibold">Sign in to EDMS</h2>
        <div className="flex flex-col gap-8">
          <div className="text-sm text-zinc-600">
            Sign in using Zoho SSO for your organization.
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
