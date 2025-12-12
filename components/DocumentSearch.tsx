"use client";

import { useState } from "react";
import { listDocuments } from "@/lib/apiClient";

interface DocumentSearchProps {
  onFilterChange: (filters: any) => void;
}

export default function DocumentSearch({ onFilterChange }: DocumentSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const handleSearch = () => {
    const filters: any = {};
    if (searchTerm) filters.search = searchTerm;
    if (type) filters.type = type;
    if (department) filters.department = department;
    if (status) filters.status = status;
    onFilterChange(filters);
  };

  const handleReset = () => {
    setSearchTerm("");
    setType("");
    setDepartment("");
    setStatus("");
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="border border-zinc-300 rounded px-3 py-2 text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-zinc-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="Policy">Policy</option>
          <option value="Procedure">Procedure</option>
          <option value="Contract">Contract</option>
          <option value="Report">Report</option>
          <option value="Form">Form</option>
        </select>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border border-zinc-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Departments</option>
          <option value="HR">HR</option>
          <option value="Legal">Legal</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
          <option value="IT">IT</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-zinc-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="expired">Expired</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-zinc-300 rounded text-sm hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}







