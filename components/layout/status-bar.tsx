"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Account } from "@/types";

interface StatusBarProps {
  account: Account;
  accounts: Account[];
  onAccountChange: (id: string) => void;
  pipelineTarget: number;
  estimatedArr: number;
  dealStage: string;
  activeAgents: number;
  oversightStatus: "active" | "idle";
}

export function StatusBar({
  account,
  accounts,
  onAccountChange,
  pipelineTarget,
  estimatedArr,
  dealStage,
  activeAgents,
  oversightStatus,
}: StatusBarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border/70 bg-surface-elevated/55 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-8">
        <div className="relative min-w-[220px]">
          <select
            value={account.id}
            onChange={(e) => onAccountChange(e.target.value)}
            className={cn(
              "w-full appearance-none rounded bg-transparent py-1.5 pr-7 text-[13px] font-medium text-text-primary",
              "border-none focus:outline-none focus:ring-0"
            )}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        </div>
        <div className="flex items-center gap-6 text-[12px]">
          <span className="text-text-muted">
            <span className="font-medium text-text-primary">${pipelineTarget.toFixed(2)}M</span>
            {" "}pipeline
          </span>
          <span className="text-text-muted">
            <span className="text-accent-muted">${estimatedArr.toFixed(2)}M</span>
            {" "}ARR
          </span>
          <span className="text-text-muted">{dealStage}</span>
          <span className="text-text-muted">
            <span className="text-text-secondary">{activeAgents}</span>
            {" "}agents
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <span className="rounded-full border border-surface-border/70 bg-surface px-2.5 py-1 text-text-muted">
          Anthropic Internal
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1",
            oversightStatus === "active"
              ? "border-accent/35 bg-accent/10 text-accent"
              : "border-surface-border/70 bg-surface text-text-faint"
          )}
        >
          {oversightStatus === "active" ? "Human approval required" : "All clear"}
        </span>
      </div>
    </header>
  );
}
