import React from "react";
import Button from "./Button";

type Column = { key: string; label: string };

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  renderRowActions,
}: {
  columns: Column[];
  data: T[];
  renderRowActions?: (row: T) => React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-zinc-100 bg-white">
      <table className="w-full table-auto text-sm">
        <thead className="bg-zinc-50 text-zinc-700">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="whitespace-nowrap px-4 py-3 text-left font-medium"
              >
                {c.label}
              </th>
            ))}
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-zinc-50">
              {columns.map((c) => (
                <td key={c.key} className="whitespace-nowrap px-4 py-3">
                  {row[c.key] ?? "-"}
                </td>
              ))}
              <td className="px-4 py-3">
                {renderRowActions ? (
                  renderRowActions(row)
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => console.log("View", row)}
                  >
                    View
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
