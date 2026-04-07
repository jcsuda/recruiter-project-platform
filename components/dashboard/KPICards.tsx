"use client";

import { KPIData } from "@/lib/dashboard-types";

interface KPICardsProps {
  data: KPIData;
}

const KPIS: readonly {
  key: keyof KPIData;
  label: string;
  unit?: string;
}[] = [
  { key: "timeToFill", label: "Time to Fill", unit: "days" },
  { key: "openRequisitions", label: "Open Requisitions" },
  { key: "offerAcceptanceRate", label: "Offer Acceptance Rate", unit: "%" },
  { key: "totalCandidates", label: "Total Candidates" },
];

export default function KPICards({ data }: KPICardsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {KPIS.map(({ key, label, unit }) => (
        <div key={key} className="card">
          <p className="mb-1 text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900">
            {data[key]}
            {unit && (
              <span className="ml-1 text-sm font-normal text-gray-500">
                {unit}
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
