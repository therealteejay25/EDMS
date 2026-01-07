"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { listDepartments, uploadDocument } from "../../lib/apiClient";

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

const DOCUMENT_TYPES = [
  { value: "Policy", label: "Policy" },
  { value: "Procedure", label: "Procedure" },
  { value: "Standard", label: "Standard" },
  { value: "Form", label: "Form" },
  { value: "Contract", label: "Contract" },
  { value: "Invoice", label: "Invoice" },
  { value: "Report", label: "Report" },
  { value: "License", label: "License" },
  { value: "Certificate", label: "Certificate" },
  { value: "Other", label: "Other" },
];

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "Policy",
    department: "",
    effectiveDate: "",
    expiryDate: "",
    tags: "",
    approvalRequired: false,
    retentionYears: "",
    uploadToZoho: false,
  });

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const depts = await listDepartments();
        const opts = depts.map((d) => ({ value: d, label: d }));
        setDepartments(opts);

        setFormData((prev) => {
          if (prev.department) return prev;
          return { ...prev, department: depts[0] || "" };
        });
      } catch (err) {
        setDepartments([]);
      }
    };
    loadDepts();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map((file) => ({
      ...file,
      id: Math.random().toString(36).substring(7),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    if (!formData.title && files.length === 1) {
      // Auto-fill title from filename if single file
      formData.title = files[0].name.replace(/\.[^/.]+$/, "");
    }

    setLoading(true);

    try {
      // Upload files sequentially (multi-file support)
      const uploadedDocs: any[] = [];

      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        form.append(
          "title",
          files.length === 1
            ? formData.title
            : `${formData.title || file.name.replace(/\.[^/.]+$/, "")} - ${
                file.name
              }`
        );
        form.append("type", formData.type);
        form.append("department", formData.department);
        if (formData.effectiveDate)
          form.append("effectiveDate", formData.effectiveDate);
        if (formData.expiryDate) form.append("expiryDate", formData.expiryDate);
        if (formData.tags) {
          const tags = formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          tags.forEach((tag) => form.append("tags[]", tag));
        }
        form.append("approvalRequired", String(formData.approvalRequired));
        if (formData.retentionYears)
          form.append("retentionYears", formData.retentionYears);
        if (formData.uploadToZoho) form.append("uploadToZoho", "1");

        setUploadProgress((prev) => ({ ...prev, [file.id]: 0 }));

        try {
          const result = await uploadDocument(form);
          uploadedDocs.push(result.doc);
          setUploadProgress((prev) => ({ ...prev, [file.id]: 100 }));
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          setError(`${file.name}: ${err.message || "Upload failed"}`);
        }
      }

      if (uploadedDocs.length > 0) {
        setSuccess(
          `Successfully uploaded ${uploadedDocs.length} document${
            uploadedDocs.length > 1 ? "s" : ""
          }`
        );
        // Reset form
        setFiles([]);
        setFormData({
          title: "",
          type: "Policy",
          department: departments?.[0]?.value || "",
          effectiveDate: "",
          expiryDate: "",
          tags: "",
          approvalRequired: false,
          retentionYears: "",
          uploadToZoho: false,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";

        // Redirect to first document or documents list
        setTimeout(() => {
          if (uploadedDocs.length === 1) {
            router.push(`/documents/${uploadedDocs[0]._id}`);
          } else {
            router.push("/documents");
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Failed to upload document(s)");
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Upload Documents
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Upload one or multiple documents with metadata tagging and indexing
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Files <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-10 hover:border-primary-400 dark:hover:border-primary-600 transition-colors">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4 flex text-sm text-zinc-600 dark:text-zinc-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                  >
                    <span>Upload files</span>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  PDF, Word, Excel, Images (MAX. 50MB per file)
                </p>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-primary-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      {uploadProgress[file.id] !== undefined && (
                        <div className="flex-shrink-0 w-24">
                          <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 transition-all"
                              style={{ width: `${uploadProgress[file.id]}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="ml-3 flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      disabled={loading}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Title */}
          <Input
            label="Document Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={
              files.length === 1 && files[0]
                ? files[0].name.replace(/\.[^/.]+$/, "")
                : "Enter document title"
            }
            helperText={
              files.length > 1
                ? "This will be used as a prefix for all files"
                : undefined
            }
          />

          {/* Document Type and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Document Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={DOCUMENT_TYPES}
            />
            <Select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              options={departments}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Effective Date"
              name="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={handleInputChange}
            />
            <Input
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleInputChange}
              helperText="Documents with expiry dates will trigger reminders"
            />
          </div>

          {/* Tags */}
          <Input
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Comma-separated tags (e.g., confidential, Q1-2024, project-alpha)"
            helperText="Separate multiple tags with commas"
          />

          {/* Additional Options */}
          <div className="space-y-4 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Additional Options
            </h3>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="approvalRequired"
                checked={formData.approvalRequired}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-zinc-300 rounded focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Require Approval
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Document will require approval before becoming active
                </p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Retention Period (Years)"
                name="retentionYears"
                type="number"
                min="1"
                value={formData.retentionYears}
                onChange={handleInputChange}
                placeholder="e.g., 7"
                helperText="Documents will be archived after this period"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="uploadToZoho"
                checked={formData.uploadToZoho}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-zinc-300 rounded focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Upload to Zoho WorkDrive
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Also sync files to Zoho WorkDrive for backup
                </p>
              </div>
            </label>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                {success}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/documents")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || files.length === 0}>
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                `Upload ${
                  files.length > 0
                    ? `${files.length} file${files.length > 1 ? "s" : ""}`
                    : "Document"
                }`
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
