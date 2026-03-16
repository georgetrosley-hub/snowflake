"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { pipelineRows } from "@/data/pipeline";
import { cn } from "@/lib/utils";

const stageOrder = [
  "Discovery",
  "Champion Build",
  "POV Selected",
  "Pilot Design",
  "Security Review",
  "Legal Review",
  "Procurement",
  "Negotiation",
  "Closed",
] as const;

const stageColors: Record<string, string> = {
  Discovery: "text-sky-400/90",
  "Champion Build": "text-amber-400/90",
  "POV Selected": "text-emerald-400/90",
  "Pilot Design": "text-accent",
  "Security Review": "text-violet-400/90",
  "Legal Review": "text-rose-400/90",
  Procurement: "text-orange-400/90",
  Negotiation: "text-emerald-500/90",
  Closed: "text-text-muted",
};

export function PipelineDashboard() {
  const totalValue = pipelineRows.reduce((sum, row) => sum + row.valueM, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Territory pipeline"
        subtitle="How I'd track and grow pipeline across these five accounts."
      />

      <div className="rounded-[22px] border border-accent/20 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-border/40 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent/80" strokeWidth={1.8} />
            <span className="text-[12px] font-medium text-text-secondary">
              Pipeline total: ${totalValue.toFixed(1)}M
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-[13px]">
            <thead>
              <tr className="border-b border-surface-border/40">
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-text-faint">
                  Account
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-text-faint">
                  Stage
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-wider text-text-faint">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wider text-text-faint">
                  Next step
                </th>
              </tr>
            </thead>
            <tbody>
              {pipelineRows.map((row, idx) => (
                <motion.tr
                  key={row.accountId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  className="border-b border-surface-border/20 last:border-b-0 transition-colors hover:bg-surface-muted/20"
                >
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {row.accountName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "font-medium",
                        stageColors[row.stage] ?? "text-text-secondary"
                      )}
                    >
                      {row.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                    ${row.valueM.toFixed(1)}M
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {row.nextStep}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[12px] text-text-faint max-w-2xl">
        How I&apos;d run these accounts: multiple deals in motion, clear next steps, and a path to close.
      </p>
    </motion.div>
  );
}
