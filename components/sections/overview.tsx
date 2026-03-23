"use client";

import { useCallback, useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { useTerritoryData } from "@/app/context/territory-data-context";
import type { PriorityAccount } from "@/data/territory-data";
import { AccountExecutionPanel } from "@/components/sections/account-execution-panel";
import { PovPlanModule } from "@/components/sections/pov-plan-module";
import { cn } from "@/lib/utils";

function accountDisplayName(id: string): string {
  const map: Record<string, string> = {
    "us-financial-technology": "U.S. Fin Tech",
    "sagent-lending": "Sagent",
    "ciena-corp": "Ciena",
  };
  return map[id] ?? id;
}

function AccountCard({
  account,
  isSelected,
  onSelect,
}: {
  account: PriorityAccount;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border p-4 transition-colors cursor-pointer",
        isSelected
          ? "border-accent/40 bg-accent/[0.08]"
          : "border-surface-border/50 bg-surface-muted/30 hover:border-accent/25"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[14px] font-semibold text-text-primary">{account.name}</h3>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase text-accent">
          P{account.priority}
        </span>
      </div>
      <p className="mt-2 text-[12px] text-text-secondary line-clamp-2">{account.whyMatters}</p>
      <p className="mt-2 text-[11px] font-medium text-accent/90">→ {account.nextAction}</p>
    </article>
  );
}

function AccountDetailCard({ account }: { account: PriorityAccount }) {
  const sections = [
    { label: "Why this account matters", value: account.whyMatters },
    { label: "Best expansion wedge", value: account.expansionWedge },
    { label: "What to confirm first", value: account.confirmFirst },
    { label: "POV hypothesis", value: account.povHypothesis },
    { label: "Recommended next action", value: account.nextAction },
  ] as const;

  return (
    <div className="space-y-3 rounded-xl border border-accent/25 bg-accent/[0.04] p-4">
      <h4 className="text-[12px] font-semibold uppercase tracking-wider text-accent/90">
        {account.name}
      </h4>
      {sections.map(({ label, value }) => (
        <div key={label}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-faint">
            {label}
          </p>
          <p className="mt-1 text-[12px] text-text-secondary">{value}</p>
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <span className="rounded bg-surface-muted/50 px-2 py-1 text-[10px] text-text-faint">
          Proof: {account.proofPoint}
        </span>
        <span className="rounded bg-surface-muted/50 px-2 py-1 text-[10px] text-text-faint">
          Pivot: {account.pivotIfNeeded}
        </span>
      </div>
    </div>
  );
}

export function Overview({
  account,
  onSelectAccount,
  onOpenStrategy,
  onOpenStrategyWithPrompt,
}: {
  account: { id: string };
  onSelectAccount: (id: string) => void;
  onOpenStrategy?: () => void;
  onOpenStrategyWithPrompt?: (prompt: string) => void;
}) {
  const { priorityAccounts, next7Days, activities, signals, addActivity, addSignal } =
    useTerritoryData();

  const [activityInput, setActivityInput] = useState("");
  const [signalInput, setSignalInput] = useState("");
  const [activityAccount, setActivityAccount] = useState(account.id);
  const [signalAccount, setSignalAccount] = useState(account.id);
  const [briefingWindow, setBriefingWindow] = useState<"24h" | "7d" | "30d">("7d");

  const selectedAccount = useMemo(
    () => priorityAccounts.find((p) => p.id === account.id) ?? priorityAccounts[0],
    [account.id, priorityAccounts]
  );

  const briefingContent = useMemo(() => {
    const w = briefingWindow;
    const base = {
      whatChanged: "Sponsor ownership and evaluation criteria tightening across accounts.",
      whyMatters: "Early POV quality now directly affects competitive position.",
      snowflakeImplication: "Lead with governed execution in high-urgency workflows.",
      databricksImplication: "Incumbent inertia persists without business-led wedge.",
      nextAction: selectedAccount.nextAction,
    };
    if (w === "24h") return { ...base, whatChanged: "Decision ownership converging across stakeholders." };
    if (w === "30d") return { ...base, whatChanged: "Formalized buying motion with governance influence." };
    return base;
  }, [briefingWindow, selectedAccount.nextAction]);

  const discoveryPrep = useMemo(
    () => ({
      angles: [
        "Where does delayed data-to-decision flow create highest business cost?",
        "What governance blockers slow deployment confidence?",
        "Which 90-day result justifies expansion sponsorship?",
      ],
      talkTracks: [
        "We can improve delivery speed without trading away governance.",
        "Start with one workflow leadership cares about and prove value fast.",
        "This is a territory execution decision, not a tooling debate.",
      ],
    }),
    []
  );

  const expansionSequence = ["Initial Workload", "Early Adoption", "Platform Trust", "Expanded Consumption"];

  const handleAddActivity = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      addActivity(activityAccount, activityInput);
      setActivityInput("");
    },
    [activityAccount, activityInput, addActivity]
  );

  const handleAddSignal = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      addSignal(signalAccount, signalInput);
      setSignalInput("");
    },
    [signalAccount, signalInput, addSignal]
  );

  return (
    <div className="space-y-8 sm:space-y-10">
      <section id="overview" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <h1 className="text-[20px] font-semibold tracking-tight text-text-primary sm:text-[22px]">
          Territory Operating System
        </h1>
        <p className="mt-2 text-[13px] text-text-muted">
          Internal account execution system for Snowflake enterprise AEs. Three priority accounts, expansion-first execution, operator-ready workflows.
        </p>
        <p className="mt-2 text-[11px] text-text-faint">
          Built with public information. Validate consumption, opportunities, and competitive footprint post-onboarding.
        </p>
        {onOpenStrategy && (
          <button
            type="button"
            onClick={onOpenStrategy}
            className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-[12px] font-medium text-accent transition-colors hover:bg-accent/20"
          >
            Open Strategy
          </button>
        )}
      </section>

      <AccountExecutionPanel />

      <section id="priority-accounts" className="scroll-mt-24 space-y-4">
        <SectionHeader
          title="Priority Accounts"
          subtitle="Three accounts. Same core problem: data complexity outpacing decision-making."
        />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {priorityAccounts.map((pa) => (
            <AccountCard
              key={pa.id}
              account={pa}
              isSelected={account.id === pa.id}
              onSelect={() => onSelectAccount(pa.id)}
            />
          ))}
        </div>
        <AccountDetailCard account={selectedAccount} />
      </section>

      <section id="account-brief" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader
          title="Account Brief"
          subtitle={`${selectedAccount.name} — signal-driven next actions`}
        />
        <div className="mt-3 flex gap-2">
          {(["24h", "7d", "30d"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setBriefingWindow(w)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
                briefingWindow === w
                  ? "border border-accent/30 bg-accent/[0.10] text-accent"
                  : "border border-surface-border/50 bg-surface-muted/40 text-text-muted hover:text-text-secondary"
              )}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[10px] uppercase text-text-faint">What changed</p>
            <p className="mt-1 text-[12px] text-text-secondary">{briefingContent.whatChanged}</p>
          </div>
          <div className="rounded-lg border border-accent/25 bg-accent/[0.06] p-3">
            <p className="text-[10px] uppercase text-accent/90">Next action</p>
            <p className="mt-1 text-[12px] text-text-secondary">{briefingContent.nextAction}</p>
          </div>
          <div className="rounded-lg border border-surface-border/50 p-3 sm:col-span-2">
            <p className="text-[10px] uppercase text-text-faint">Snowflake implication</p>
            <p className="mt-1 text-[12px] text-text-secondary">{briefingContent.snowflakeImplication}</p>
          </div>
        </div>
      </section>

      <section id="discovery-prep" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader title="Discovery Prep" subtitle="Angles and talk tracks for qualification calls" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase text-text-faint">Discovery angles</p>
            <ul className="mt-2 space-y-1.5 text-[12px] text-text-secondary">
              {discoveryPrep.angles.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase text-text-faint">Talk tracks</p>
            <ul className="mt-2 space-y-1.5 text-[12px] text-text-secondary">
              {discoveryPrep.talkTracks.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {onOpenStrategyWithPrompt ? (
        <PovPlanModule
          priorityAccount={selectedAccount}
          onGeneratePovPlan={onOpenStrategyWithPrompt}
        />
      ) : (
        <section id="pov-plan" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
          <SectionHeader title="POV Plan" subtitle="Hypothesis-led positioning vs Databricks" />
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-3">
              <p className="text-[11px] font-medium uppercase text-accent/90">POV hypothesis</p>
              <p className="mt-1 text-[12px] text-text-secondary">{selectedAccount.povHypothesis}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-surface-border/50 bg-surface-muted/30 p-3">
                <p className="text-[10px] uppercase text-text-faint">Snowflake</p>
                <p className="mt-1 text-[12px] text-text-secondary">
                  Governed enterprise execution; faster path to measurable outcomes.
                </p>
              </div>
              <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.05] p-3">
                <p className="text-[10px] uppercase text-rose-300/90">Databricks</p>
                <p className="mt-1 text-[12px] text-text-secondary">
                  Technical incumbency remains where business proof is weak.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="expansion-path" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader title="Expansion Path" subtitle="Land → prove → expand sequence" />
        <div className="mt-4 flex flex-wrap gap-2">
          {expansionSequence.map((step) => (
            <span
              key={step}
              className="rounded-lg border border-surface-border/50 bg-surface-muted/30 px-3 py-2 text-[12px] font-medium text-text-secondary"
            >
              {step}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-text-secondary">
          Land one workflow, prove value quickly, then broaden adoption across teams.
        </p>
      </section>

      <section id="this-weeks-priorities" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader title="Weekly Briefing" subtitle="This week's operating priorities" />
        <ul className="mt-4 space-y-2">
          {next7Days.map((item) => (
            <li
              key={`${item.day}-${item.action}`}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-surface-border/50 bg-surface-muted/30 px-3 py-2 text-[12px]"
            >
              <span className="font-medium text-text-faint">{item.day}</span>
              <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] text-accent">
                {accountDisplayName(item.account)}
              </span>
              <span className="text-text-secondary">{item.action}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="recent-signals" className="scroll-mt-24 space-y-4">
        <SectionHeader
          title="Signals & Activity"
          subtitle="Curated news, outreach log—connect to CRM post-onboarding"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-surface-border/50 bg-surface-elevated/30 p-4">
            <h4 className="text-[12px] font-semibold text-text-primary">Activity Feed</h4>
            <form onSubmit={handleAddActivity} className="mt-3 flex gap-2">
              <input
                type="text"
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                placeholder="Log activity..."
                className="min-w-0 flex-1 rounded-lg border border-surface-border/50 bg-surface px-2.5 py-2 text-[12px] text-text-primary placeholder:text-text-faint"
              />
              <select
                value={activityAccount}
                onChange={(e) => setActivityAccount(e.target.value)}
                className="rounded-lg border border-surface-border/50 bg-surface px-2 py-2 text-[12px] text-text-primary"
              >
                {priorityAccounts.map((pa) => (
                  <option key={pa.id} value={pa.id}>
                    {accountDisplayName(pa.id)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-accent/90 px-3 py-2 text-[11px] font-medium text-white hover:bg-accent"
              >
                Add
              </button>
            </form>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {activities.slice(0, 8).map((a, i) => (
                <div key={i} className="flex gap-2 text-[11px]">
                  <span className="shrink-0 text-text-faint">{a.timestamp}</span>
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">
                    {accountDisplayName(a.account)}
                  </span>
                  <span className="text-text-secondary">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-surface-border/50 bg-surface-elevated/30 p-4">
            <h4 className="text-[12px] font-semibold text-text-primary">Signal Tracker</h4>
            <form onSubmit={handleAddSignal} className="mt-3 flex gap-2">
              <input
                type="text"
                value={signalInput}
                onChange={(e) => setSignalInput(e.target.value)}
                placeholder="Add signal..."
                className="min-w-0 flex-1 rounded-lg border border-surface-border/50 bg-surface px-2.5 py-2 text-[12px] text-text-primary placeholder:text-text-faint"
              />
              <select
                value={signalAccount}
                onChange={(e) => setSignalAccount(e.target.value)}
                className="rounded-lg border border-surface-border/50 bg-surface px-2 py-2 text-[12px] text-text-primary"
              >
                {priorityAccounts.map((pa) => (
                  <option key={pa.id} value={pa.id}>
                    {accountDisplayName(pa.id)}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-accent/90 px-3 py-2 text-[11px] font-medium text-white hover:bg-accent"
              >
                Add
              </button>
            </form>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
              {signals.slice(0, 8).map((s, i) => (
                <div key={i} className="flex gap-2 text-[11px]">
                  <span className="shrink-0 text-text-faint">{s.timestamp}</span>
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">
                    {accountDisplayName(s.account)}
                  </span>
                  <span className="text-text-secondary">{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
