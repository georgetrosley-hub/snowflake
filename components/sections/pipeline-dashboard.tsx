"use client";

import { motion } from "framer-motion";
import { BarChart3, Inbox } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { pipelineRows } from "@/data/pipeline";
import { cn } from "@/lib/utils";
import { useApp } from "@/app/context/app-context";

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
  const { workspaceDraft, updateWorkspaceField } = useApp();
  const totalValue = pipelineRows.reduce((sum, row) => sum + row.valueM, 0);
  const hasRows = pipelineRows.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Territory pipeline"
        subtitle="Net-new logos and expansion within existing customers. Add accounts in data/pipeline.ts and data/accounts.ts once you receive the 15 from the previous rep."
      />

      <section className="rounded-[22px] border border-accent/20 bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
            Deal header (Snowflake-style)
          </p>
          <p className="text-[11px] text-text-muted">
            Forecast:{" "}
            <span className="font-medium text-text-secondary">
              {workspaceDraft.forecastCategory}
            </span>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
              Opportunity name
            </label>
            <input
              value={workspaceDraft.opportunityName}
              onChange={(e) => updateWorkspaceField("opportunityName", e.target.value)}
              placeholder="U.S. Financial Technology · Priority Workload Expansion"
              className="w-full rounded-lg border border-surface-border/50 bg-surface px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted/60 focus:border-accent/30 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
              ACV (USD)
            </label>
            <input
              inputMode="decimal"
              value={workspaceDraft.acvUsd}
              onChange={(e) =>
                updateWorkspaceField("acvUsd", e.target.value.replace(/[^\d.]/g, ""))
              }
              placeholder="250000"
              className="w-full rounded-lg border border-surface-border/50 bg-surface px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted/60 focus:border-accent/30 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
              Term (months)
            </label>
            <select
              value={workspaceDraft.termMonths}
              onChange={(e) => updateWorkspaceField("termMonths", e.target.value)}
              className="w-full rounded-lg border border-surface-border/50 bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-accent/30 focus:outline-none"
            >
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="36">36</option>
              <option value="48">48</option>
              <option value="60">60</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
              Forecast category
            </label>
            <select
              value={workspaceDraft.forecastCategory}
              onChange={(e) =>
                updateWorkspaceField(
                  "forecastCategory",
                  e.target.value as typeof workspaceDraft.forecastCategory
                )
              }
              className="w-full rounded-lg border border-surface-border/50 bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-accent/30 focus:outline-none"
            >
              <option value="Pipeline">Pipeline</option>
              <option value="Best Case">Best Case</option>
              <option value="Commit">Commit</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-text-faint">
          Tip: Deal size is typically tracked as ACV; term drives TCV. Commit is a forecast category.
        </p>
      </section>

      <div className="rounded-[22px] border border-accent/20 bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-border/40 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent/80" strokeWidth={1.8} />
            <span className="text-[12px] font-medium text-text-secondary">
              {hasRows ? `Pipeline total: $${totalValue.toFixed(1)}M` : "No accounts yet"}
            </span>
          </div>
        </div>
        {hasRows ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Inbox className="h-10 w-10 text-text-faint/50 mb-3" strokeWidth={1.5} />
            <p className="text-[14px] font-medium text-text-primary">
              No accounts in pipeline yet
            </p>
            <p className="mt-1 text-[12px] text-text-muted max-w-sm">
              Once you receive the 15 accounts from the previous rep, add them to{" "}
              <code className="rounded bg-surface-muted/50 px-1 py-0.5 text-[11px]">data/accounts.ts</code>
              {" "}and{" "}
              <code className="rounded bg-surface-muted/50 px-1 py-0.5 text-[11px]">data/pipeline.ts</code>
              . Pipeline and war room will populate here.
            </p>
          </div>
        )}
      </div>

      {hasRows && (
        <p className="text-[12px] text-text-faint max-w-2xl">
          Multiple deals in motion, clear next steps, and a path to close.
        </p>
      )}
    </motion.div>
  );
}
