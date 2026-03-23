"use client";

import { useMemo } from "react";
import { useTerritoryData } from "@/app/context/territory-data-context";
import type { PriorityAccount } from "@/data/territory-data";
import { cn } from "@/lib/utils";
import {
  Target,
  TrendingUp,
  BookOpenCheck,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AccountPlaybook } from "./account-playbook";
import { PovPlanModule } from "./pov-plan-module";

function accountDisplayName(id: string): string {
  const map: Record<string, string> = {
    "us-financial-technology": "U.S. Fin Tech",
    "sagent-lending": "Sagent",
    "ciena-corp": "Ciena",
  };
  return map[id] ?? id;
}

interface OverviewProps {
  account: { id: string };
  onSelectAccount: (id: string) => void;
  onOpenStrategy?: () => void;
  onOpenStrategyWithPrompt?: (prompt: string) => void;
}

export function Overview({ account, onSelectAccount, onOpenStrategy, onOpenStrategyWithPrompt }: OverviewProps) {
  const { priorityAccounts, next7Days, signals } = useTerritoryData();

  const selectedAccount = useMemo(
    () => priorityAccounts.find((p) => p.id === account.id) ?? priorityAccounts[0],
    [account.id, priorityAccounts]
  );

  const summaryCards = useMemo(
    () => [
      { label: "Priority Accounts", value: priorityAccounts.length, icon: Target },
      { label: "Expansion Motions", value: priorityAccounts.length, icon: TrendingUp },
      { label: "POV-Ready", value: priorityAccounts.filter((p) => p.povHypothesis).length, icon: BookOpenCheck },
      { label: "This Week", value: next7Days.length, icon: Calendar },
    ],
    [priorityAccounts, next7Days]
  );

  const handleReviewAccounts = () => {
    document.getElementById("priority-accounts")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenBriefing = () => {
    document.getElementById("this-weeks-priorities")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-16 lg:space-y-20">
      {/* ——— Section 2: Hero ——— */}
      <section id="overview" className="scroll-mt-24">
        <div className="space-y-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent/80">
            Snowflake Enterprise AE
          </p>
          <h1 className="text-[32px] font-semibold leading-[1.12] tracking-tight text-text-primary sm:text-[38px] lg:text-[42px] max-w-3xl">
            Territory Operating System
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            Workload identification, discovery prep, POV plans, and expansion execution for strategic accounts.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReviewAccounts}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-accent/90"
            >
              View Priority Accounts
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={handleOpenBriefing}
              className="inline-flex items-center gap-2 rounded-lg border border-surface-border/50 bg-surface-elevated/50 px-5 py-2.5 text-[13px] font-medium text-text-primary transition-colors hover:bg-surface-muted/50 hover:border-surface-border/70"
            >
              Weekly Briefing
            </button>
          </div>
        </div>
      </section>

      {/* ——— Section 3: Summary Cards ——— */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-surface-border/35 bg-surface-elevated/40 px-5 py-4 transition-colors hover:border-surface-border/50"
          >
            <Icon className="h-4 w-4 text-accent/70" strokeWidth={1.8} />
            <p className="mt-3 text-[22px] font-semibold tabular-nums text-text-primary">{value}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-text-faint">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* ——— Section 4: This Week's Priorities ——— */}
      <section id="this-weeks-priorities" className="scroll-mt-24">
        <div className="rounded-xl border border-surface-border/35 bg-surface-elevated/40 overflow-hidden">
          <div className="border-b border-surface-border/35 px-6 py-4">
            <h2 className="text-[13px] font-semibold tracking-tight text-text-primary">
              This Week&apos;s Priorities
            </h2>
            <p className="mt-0.5 text-[11px] text-text-faint">
              Action-oriented next steps by account
            </p>
          </div>
          <ul className="divide-y divide-surface-border/25">
            {next7Days.map((item, i) => (
              <li
                key={`${item.day}-${item.action}-${i}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-muted/20"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-text-faint">{item.day}</span>
                  <span className="mx-2 text-surface-border/60">·</span>
                  <span className="text-[13px] text-text-secondary">{item.action}</span>
                </div>
                <span className="shrink-0 rounded bg-surface-muted/40 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-text-faint">
                  {accountDisplayName(item.account)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— Section 5: Priority Accounts + Playbook ——— */}
      <section id="priority-accounts" className="scroll-mt-24 space-y-8">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight text-text-primary">
            Priority Accounts
          </h2>
          <p className="mt-0.5 text-[11px] text-text-faint">
            Select an account to view expansion playbook
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {priorityAccounts.map((pa) => (
            <PriorityAccountCard
              key={pa.id}
              account={pa}
              isSelected={account.id === pa.id}
              onSelect={() => {
                onSelectAccount(pa.id);
                setTimeout(() => {
                  document.getElementById("account-playbook")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
            />
          ))}
        </div>
        <div id="account-playbook" className="scroll-mt-24 pt-4">
          <AccountPlaybook
            account={selectedAccount}
            onOpenStrategy={onOpenStrategy}
          />
        </div>
      </section>

      {/* POV Plan — first-class expansion motion */}
      {onOpenStrategyWithPrompt && (
        <PovPlanModule
          priorityAccount={selectedAccount}
          onGeneratePovPlan={onOpenStrategyWithPrompt}
        />
      )}

      {/* ——— Section 6: Recent Signals ——— */}
      <section id="recent-signals" className="scroll-mt-24">
        <div className="rounded-xl border border-surface-border/35 bg-surface-elevated/40 overflow-hidden">
          <div className="border-b border-surface-border/35 px-6 py-4">
            <h2 className="text-[13px] font-semibold tracking-tight text-text-primary">
              Recent Signals
            </h2>
            <p className="mt-0.5 text-[11px] text-text-faint">
              Intel, news, and activity by account
            </p>
          </div>
          <ul className="divide-y divide-surface-border/25">
            {signals.slice(0, 8).map((s, i) => (
              <li
                key={`${s.timestamp}-${s.text}-${i}`}
                className="flex flex-col gap-1 px-6 py-4 transition-colors hover:bg-surface-muted/20 sm:flex-row sm:items-start sm:justify-between"
              >
                <p className="min-w-0 flex-1 text-[13px] text-text-secondary">{s.text}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[10px] text-text-faint">{s.timestamp}</span>
                  <span className="rounded bg-surface-muted/40 px-2 py-0.5 text-[10px] font-medium text-text-faint">
                    {accountDisplayName(s.account)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* AI Assist — floating or inline CTA */}
      {onOpenStrategy && (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                <Sparkles className="h-5 w-5 text-accent/80" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-text-primary">
                  Deal Strategy
                </h3>
                <p className="mt-1 text-[12px] text-text-secondary">
                  Discovery agendas, POV talking points, stakeholder maps for {selectedAccount.name}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenStrategy}
              className="shrink-0 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-[12px] font-medium text-accent transition-colors hover:bg-accent/20"
            >
              Open Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityAccountCard({
  account,
  isSelected,
  onSelect,
}: {
  account: PriorityAccount;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-xl border p-4 text-left transition-all duration-150 w-full max-w-[240px]",
        isSelected
          ? "border-accent/30 bg-accent/[0.06] shadow-sm"
          : "border-surface-border/35 bg-surface-elevated/40 hover:border-surface-border/50 hover:bg-surface-elevated/60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold tracking-tight text-text-primary">
          {account.name}
        </h3>
        <span className="shrink-0 rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent/90">
          P{account.priority}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-text-faint">
        {account.industry}
      </p>
      <p className="mt-2 text-[12px] text-text-secondary line-clamp-2">
        {account.expansionWedge}
      </p>
      <p className="mt-2 text-[11px] font-medium text-accent/90 line-clamp-1">
        {account.nextAction}
      </p>
    </button>
  );
}
