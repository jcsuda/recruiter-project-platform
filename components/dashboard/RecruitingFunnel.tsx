"use client";

import { FunnelData } from "@/lib/dashboard-types";

interface RecruitingFunnelProps {
  data: FunnelData[];
  rejectedCount?: number;
  withdrawnCount?: number;
}

const STAGE_COLORS = [
  "bg-blue-300",
  "bg-violet-400",
  "bg-pink-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-green-400",
];

export default function RecruitingFunnel({
  data,
  rejectedCount = 0,
  withdrawnCount = 0,
}: RecruitingFunnelProps) {
  if (data.length === 0 && !rejectedCount && !withdrawnCount) {
    return (
      <div className="card">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Recruiting Funnel
        </h3>
        <p className="py-8 text-center text-sm text-gray-500">
          No candidate data available yet.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(
    ...data.map((d) => d.count),
    rejectedCount,
    withdrawnCount
  );

  const renderBar = (
    label: string,
    count: number,
    colorClass: string,
    subtext?: string
  ) => {
    const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
      <div key={label} className="flex items-center gap-4">
        <div className="w-40 shrink-0 text-sm font-medium text-gray-700">
          {label}
        </div>
        <div className="relative h-10 flex-1 overflow-hidden rounded bg-gray-100">
          <div
            className={`flex h-full items-center pl-3 text-sm font-semibold text-white transition-all duration-300 ${colorClass}`}
            style={{ width: `${widthPercent}%` }}
          >
            {count > 0 && count}
          </div>
        </div>
        <div className="w-24 text-right">
          <div className="text-sm font-semibold text-gray-900">{count}</div>
          {subtext && (
            <div className="text-xs text-gray-500">{subtext}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Recruiting Funnel
      </h3>
      <div className="flex flex-col gap-2">
        {data.map((stage, index) =>
          renderBar(
            stage.stage,
            stage.count,
            STAGE_COLORS[index % STAGE_COLORS.length],
            stage.conversionRate !== undefined
              ? `${stage.conversionRate.toFixed(1)}% conv.`
              : undefined
          )
        )}

        {data.length > 0 && (
          <div className="my-2 border-t-2 border-dashed border-gray-200 pt-2 text-center text-xs text-gray-500">
            Exit States
          </div>
        )}

        {renderBar("Rejected", rejectedCount, "bg-red-400", "Did not meet criteria")}
        {renderBar("Withdrawn", withdrawnCount, "bg-gray-400", "Withdrew from process")}
      </div>
    </div>
  );
}
