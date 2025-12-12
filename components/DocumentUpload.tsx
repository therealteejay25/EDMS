"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { uploadDocument } from "@/lib/apiClient";

interface DocumentUploadProps {
  onSuccess?: (doc: any) => void;
}

export default function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    type: "Policy",
    department: "HR",
    effectiveDate: "",
    expiryDate: "",
    tags: "",
    approvalRequired: false,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (!input || !input.files?.[0]) {
        throw new Error("Please select a file");
      }

      const form = new FormData();
      form.append("file", input.files[0]);
      form.append("title", formData.title);
      form.append("type", formData.type);
      form.append("department", formData.department);
      if (formData.effectiveDate)
        form.append("effectiveDate", formData.effectiveDate);
      if (formData.expiryDate) form.append("expiryDate", formData.expiryDate);
      if (formData.tags)
        form.append(
          "tags",
          formData.tags
            .split(",")
            .map((t) => t.trim())
            .join(",")
        );
      form.append("approvalRequired", String(formData.approvalRequired));

      const result = await uploadDocument(form);
      setFormData({
        title: "",
        type: "Policy",
        department: "HR",
        effectiveDate: "",
        expiryDate: "",
        tags: "",
        approvalRequired: false,
      });
      if (input) input.value = "";
      const doc = result.doc || result;
      onSuccess?.(doc);
      // Show success message but don't auto-redirect (let user decide)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Document</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Document File
          </label>
          <input
            type="file"
            required
            className="w-full border border-zinc-300 rounded px-3 py-2"
            accept=".pdf,.doc,.docx,.xlsx,.png,.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-zinc-300 rounded px-3 py-2"
            placeholder="Document title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded px-3 py-2"
            >
              <option>Policy</option>
              <option>Procedure</option>
              <option>Form</option>
              <option>Contract</option>
              <option>Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded px-3 py-2"
            >
              <option>HR</option>
              <option>Legal</option>
              <option>Finance</option>
              <option>Operations</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Effective Date
            </label>
            <input
              type="date"
              name="effectiveDate"
              value={formData.effectiveDate}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full border border-zinc-300 rounded px-3 py-2"
            placeholder="e.g. important, compliance, review"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="approvalRequired"
            checked={formData.approvalRequired}
            onChange={handleChange}
            className="rounded border-zinc-300"
          />
          <span className="text-sm">Requires Approval</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </div>
  );
}
