"use client";
import React, { useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [type_, setType] = useState("Policy");
  const [department, setDepartment] = useState("Legal");
  const [effective, setEffective] = useState("");
  const [status, setStatus] = useState("Draft");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "";
      const form = new FormData();
      form.append("title", title);
      form.append("type", type_);
      form.append("department", department);
      form.append("effectiveDate", effective);
      form.append("status", status);
      const fileInput = document.querySelector(
        "input[type=file]"
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) form.append("file", fileInput.files[0]);
      const res = await fetch(`${API}/api/documents`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Upload failed");
      }
      alert("Uploaded");
    } catch (err) {
      alert("Upload error: " + (err.message || err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-semibold">Upload Document</h1>
      <Card>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="flex flex-col gap-2 text-sm">
            <span>Document Type</span>
            <select
              className="rounded-md border border-zinc-200 px-3 py-2"
              value={type_}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Policy</option>
              <option>Procedure</option>
              <option>Standard</option>
              <option>Form</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span>Department</span>
            <select
              className="rounded-md border border-zinc-200 px-3 py-2"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option>Legal</option>
              <option>HR</option>
              <option>IT</option>
              <option>Finance</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span>Effective Date</span>
            <input
              className="rounded-md border border-zinc-200 px-3 py-2"
              type="date"
              value={effective}
              onChange={(e) => setEffective(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span>Status</span>
            <select
              className="rounded-md border border-zinc-200 px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Draft</option>
              <option>Active</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span>File</span>
            <input
              type="file"
              className="rounded-md border border-zinc-200 px-3 py-2"
            />
          </label>

          <div className="flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
