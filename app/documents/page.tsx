"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Input from "../../components/Input";
import Select from "../../components/Select";
import {
  listDocuments,
  Document,
  formatDateTime,
  getBadgeVariant,
  listDepartments,
} from "../../lib/apiClient";
import { documentStatusLabel, titleCase } from "../../lib/display";
import Link from "next/link";

const DOCUMENT_TYPES = [
  { value: "", label: "All Types" },
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

const DEFAULT_DEPARTMENTS = [{ value: "", label: "All Departments" }];

const STATUSES = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "expired", label: "Expired" },
];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>(
    DEFAULT_DEPARTMENTS
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    department: "",
    status: "",
  });

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listDocuments({
        ...filters,
        page,
        limit: pageSize,
      });
      setDocuments(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDocuments();
  }, [page]);

  React.useEffect(() => {
    const loadDepts = async () => {
      try {
        const depts = await listDepartments();
        setDepartments([
          { value: "", label: "All Departments" },
          ...depts.map((d) => ({ value: d, label: d })),
        ]);
      } catch (err) {
        setDepartments(DEFAULT_DEPARTMENTS);
      }
    };
    loadDepts();
  }, []);

  React.useEffect(() => {
    setPage(1);
    loadDocuments();
  }, [filters.search, filters.type, filters.department, filters.status]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPage(1);
    loadDocuments();
  };

  const handleReset = () => {
    setFilters({ search: "", type: "", department: "", status: "" });
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Documents
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage and search through all documents in the system
          </p>
        </div>
        <Button onClick={() => router.push("/upload")}>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Search"
              placeholder="Search by title, content..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Select
              label="Type"
              options={DOCUMENT_TYPES}
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            />
            <Select
              label="Department"
              options={departments}
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
            />
            <Select
              label="Status"
              options={STATUSES}
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 ml-auto">
              {total} document{total !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>
      </Card>

      {/* Documents Table */}
      <Card padding="none">
        {loading ? (
          <div className="p-12 text-center">
            <div className="loader"></div>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Loading documents...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg m-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500"
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
            <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              No documents found
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Try adjusting your filters or upload a new document
            </p>
            <Button className="mt-4" onClick={() => router.push("/upload")}>
              Upload Document
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {documents.map((doc) => (
                    <tr
                      key={doc._id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Link
                            href={`/documents/${doc._id}`}
                            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            {doc.title}
                          </Link>
                          {doc.legalHold && (
                            <Badge variant="danger" className="ml-2">
                              Legal Hold
                            </Badge>
                          )}
                        </div>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {doc.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                +{doc.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {titleCase(doc.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {doc.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getBadgeVariant(doc.status)}>
                          {documentStatusLabel(doc.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        v{doc.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(doc.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                        {doc.owner?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/documents/${doc._id}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, total)} of {total} documents
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
