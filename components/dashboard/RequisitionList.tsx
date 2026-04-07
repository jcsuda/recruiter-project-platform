"use client";

import { Requisition } from "@/lib/dashboard-types";

interface RequisitionListProps {
  requisitions: Requisition[];
  onEdit: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  interviewing: "bg-blue-100 text-blue-800",
  offer_extended: "bg-amber-100 text-amber-800",
  closed: "bg-gray-100 text-gray-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function RequisitionList({
  requisitions,
  onEdit,
}: RequisitionListProps) {
  if (requisitions.length === 0) {
    return (
      <div className="card">
        <p className="py-8 text-center text-sm text-gray-500">
          No requisitions yet. Click &quot;+ Add Requisition&quot; to create
          your first position.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-medium text-gray-700">Position</th>
            <th className="px-4 py-3 font-medium text-gray-700">Department</th>
            <th className="px-4 py-3 font-medium text-gray-700">Status</th>
            <th className="px-4 py-3 font-medium text-gray-700">Priority</th>
            <th className="px-4 py-3 font-medium text-gray-700">Location</th>
            <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requisitions.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {req.position_title}
                {req.hiring_manager && (
                  <div className="text-xs text-gray-500">
                    {req.hiring_manager}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {req.department || "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`badge ${STATUS_STYLES[req.status] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {req.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`badge ${PRIORITY_STYLES[req.priority ?? "medium"]}`}
                >
                  {req.priority ?? "medium"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {req.location || "—"}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onEdit(req.id)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
