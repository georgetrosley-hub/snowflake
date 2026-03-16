"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { AlertTriangle, ArrowRight, Crosshair, Users, Eye, CircleDot, Zap, Target } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { SectionId } from "@/components/layout/sidebar";
import { MetricCard } from "@/components/ui/metric-card";
import { OpenAILogoImage } from "@/components/ui/openai-logo";
import { useToast } from "@/app/context/toast-context";
import { isStale } from "@/lib/deal-health";
import { getPlansForThisWeek, getPlansForThisWeekShort } from "@/lib/plans-for-week";
import type {
  Account,
  AccountSignal,
  AccountUpdate,
  Competitor,
  ExecutionItem,
  Stakeholder,
  WorkspaceDraft,
} from "@/types";
import type { DealHealthSummary } from "@/lib/deal-health";

function getTodayLabel() {
  const d = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

interface OverviewProps {
  account: Account;
  competitors: Competitor[];
  signals: AccountSignal[];
  stakeholders: Stakeholder[];
  executionItems: ExecutionItem[];
  accountUpdates: AccountUpdate[];
  workspaceDraft: WorkspaceDraft;
  pipelineTarget: number;
  currentRecommendation: string;
  dealHealth: DealHealthSummary;
  onUpdateWorkspaceField: (field: keyof WorkspaceDraft, value: string) => void;
  onAddAccountUpdate: (
    title: string,
    note: string,
    tag: AccountUpdate["tag"]
  ) => void;
  onSectionChange?: (id: SectionId) => void;
}

export function Overview({
  account,
  competitors,
  signals,
  stakeholders,
  executionItems,
  accountUpdates,
  workspaceDraft,
  pipelineTarget,
  currentRecommendation,
  dealHealth,
  onUpdateWorkspaceField,
  onAddAccountUpdate,
  onSectionChange,
}: OverviewProps) {
  const saveToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();

  const handleWorkspaceFieldChange = useCallback(
    (field: keyof WorkspaceDraft, value: string) => {
      onUpdateWorkspaceField(field, value);
      if (saveToastRef.current) clearTimeout(saveToastRef.current);
      saveToastRef.current = setTimeout(() => {
        showToast("Saved");
        saveToastRef.current = null;
      }, 600);
    },
    [onUpdateWorkspaceField, showToast]
  );
  const topCompetitor = [...competitors].sort((a, b) => b.accountRiskLevel - a.accountRiskLevel)[0];
  const champion = stakeholders.find((stakeholder) => stakeholder.stance === "champion");
  const championCount = stakeholders.filter((stakeholder) => stakeholder.stance === "champion" || stakeholder.stance === "ally").length;
  const blockedCount = executionItems.filter((item) => item.status === "blocked").length;
  const thisWeek = executionItems.filter((item) => item.status === "in_progress" || item.status === "ready").slice(0, 3);
  const firstDecision = executionItems.find((item) => item.phase === "Land");
  const expansionItem = executionItems.find((item) => item.phase === "Expansion");

  const todayLabel = useMemo(() => getTodayLabel(), []);
  const topPriority = executionItems.find((i) => i.status === "blocked") ?? executionItems.find((i) => i.status === "in_progress");
  const lastUpdate = accountUpdates[0];
  const plansForThisWeek = useMemo(
    () => getPlansForThisWeek(accountUpdates, executionItems),
    [accountUpdates, executionItems]
  );
  const plansForThisWeekShort = useMemo(
    () => getPlansForThisWeekShort(accountUpdates, executionItems),
    [accountUpdates, executionItems]
  );

  const blockedItems = executionItems.filter((i) => i.status === "blocked");
  const needsAttention = executionItems.filter(
    (i) => i.decisionRequired && i.decisionStatus === "pending"
  );
  const staleItems = executionItems.filter((i) => isStale(i.lastUpdated));

  return (
    <div
      className="space-y-10 sm:space-y-12"
    >
      {/* Recruiter-facing: OpenAI product feel */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/15 bg-accent/[0.04] px-4 py-3">
        <OpenAILogoImage size={18} className="opacity-95" />
        <span className="text-[12px] font-medium text-text-primary">
          Enterprise GTM war room — built to feel like an OpenAI product
        </span>
        <span className="text-[11px] text-text-muted">
          · George Trosley
        </span>
      </div>

      {/* VP oversight — 30-second scan */}
      <section className="rounded-2xl border border-accent/20 bg-white/[0.02] p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-text-faint" strokeWidth={1.8} />
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-faint">
            VP oversight · At a glance
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${
              dealHealth.status === "healthy"
                ? "bg-emerald-500/10 text-emerald-400/90"
                : dealHealth.status === "attention"
                  ? "bg-accent/10 text-accent/90"
                  : "bg-rose-500/10 text-rose-400/90"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                dealHealth.status === "healthy"
                  ? "bg-emerald-400"
                  : dealHealth.status === "attention"
                    ? "bg-accent"
                    : "bg-rose-400"
              }`}
            />
            {dealHealth.label}
          </div>
          {blockedItems.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1.5 text-[12px] font-medium text-rose-400/95">
              <CircleDot className="h-3.5 w-3.5" />
              {blockedItems.length} blocker{blockedItems.length === 1 ? "" : "s"}
            </div>
          )}
          {needsAttention.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-[12px] font-medium text-accent/90">
              {needsAttention.length} decision{needsAttention.length === 1 ? "" : "s"} pending
            </div>
          )}
          {staleItems.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[12px] text-text-muted">
              {staleItems.length} stale
            </div>
          )}
        </div>
        <p className="mt-3 text-[12px] text-text-muted">{dealHealth.reason}</p>
      </section>

      {/* Today's workspace — compact status strip */}
      <section className="rounded-2xl border border-surface-border bg-surface-elevated p-4 sm:p-6 shadow-elevated">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              {todayLabel} · {account.name}
            </p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
              Today&apos;s workspace
            </h1>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => document.getElementById("plans-for-this-week-detail")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex min-h-[88px] touch-target flex-col justify-start rounded-xl border border-accent/25 bg-surface-muted/50 px-4 py-3.5 text-left transition-colors active:bg-surface-muted/70 hover:bg-surface-muted/70 hover:border-accent/40 sm:min-h-0"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Plans for this week</p>
            </div>
            <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-relaxed text-text-secondary">
              {plansForThisWeekShort}
            </p>
            <p className="mt-1.5 text-[11px] text-text-faint">
              Tap for full detail ↓
            </p>
          </button>
          <button
            type="button"
            onClick={() => onSectionChange?.("accountLog")}
            className="flex min-h-[88px] touch-target flex-col justify-center rounded-xl border border-accent/25 bg-surface-muted/50 px-4 py-4 text-left transition-colors active:bg-surface-muted/70 hover:bg-surface-muted/70 hover:border-accent/40 sm:min-h-0 sm:py-3.5"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Where I left off</p>
            </div>
            <p className="mt-2 text-[15px] font-bold text-text-primary">
              {lastUpdate?.title ?? "Daily account reset"}
            </p>
            <p className="mt-0.5 text-[13px] text-text-secondary">{lastUpdate?.createdAt ?? "Today"}</p>
          </button>
          <button
            type="button"
            onClick={() => onSectionChange?.("first90Days")}
            className="flex min-h-[88px] touch-target flex-col justify-center rounded-xl border border-accent/25 bg-surface-muted/50 px-4 py-4 text-left transition-colors active:bg-surface-muted/70 hover:bg-surface-muted/70 hover:border-accent/40 sm:min-h-0 sm:py-3.5"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Today&apos;s priority</p>
            </div>
            <p className="mt-2 text-[15px] font-bold text-text-primary">
              {topPriority?.title ?? "Define the first pilot"}
            </p>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              {topPriority?.owner ?? champion?.name} · {topPriority?.dueLabel ?? "This week"}
            </p>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-faint">
          Capture plan · {account.name}
        </p>
        <div className="max-w-4xl space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            How I&apos;d build pipeline and expansion for OpenAI Enterprise inside {account.name}
          </h2>
          <p className="max-w-3xl text-[14px] leading-relaxed text-text-muted">
            First wedge, champion path, pilot design, executive alignment, competitive displacement, and the expansion story — built to feel like an OpenAI product.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Modeled pipeline"
          value={`$${pipelineTarget.toFixed(2)}M`}
          subtitle="Combined land motion plus near-term expansion path"
        />
        <MetricCard
          label="First pilot"
          value={`$${account.estimatedLandValue.toFixed(2)}M`}
          subtitle={account.firstWedge}
        />
        <MetricCard
          label="Expansion path"
          value={`$${account.estimatedExpansionValue.toFixed(2)}M`}
          subtitle={account.topExpansionPaths[0]}
        />
        <MetricCard
          label="Deal coverage"
          value={`${championCount} threads`}
          subtitle={`${blockedCount} blocker${blockedCount === 1 ? "" : "s"} need to be actively managed`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <section className="min-w-0 rounded-[28px] border border-accent/20 bg-white/[0.02] p-4 sm:p-6">
          <SectionHeader
            title="How I&apos;d run this account"
            subtitle="The capture-plan view: how I&apos;d create urgency, who I&apos;d build with, what pilot I&apos;d land, and how I&apos;d expand."
          />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Land motion</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">{account.firstWedge}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                I would keep the first sale narrow, measurable, and easy to sponsor internally. The goal is not to sell
                the whole platform first. The goal is to win a wedge that creates permission to expand.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Champion building</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {champion?.title ?? "Likely functional champion"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {champion?.note ?? "I would look for the operator with the most pain, the strongest urgency, and the most to gain from a successful pilot."}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Pilot strategy</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {firstDecision?.title ?? "Define the first pilot"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {firstDecision?.detail ?? "I would define success criteria, owners, timeline, and the exact workflow before asking for broad executive support."}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Expansion path</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {expansionItem?.title ?? account.topExpansionPaths[0]}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                I would name the second motion early so leadership sees this as a wedge into broader adoption, not a one-off tooling experiment.
              </p>
            </div>
          </div>
        </section>

        <aside className="min-w-0 space-y-4">
          <div className="rounded-[28px] border border-accent/15 bg-accent/[0.05] p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <OpenAILogoImage size={16} className="opacity-90" />
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent/80">
                My current take
              </p>
            </div>
            <p className="mt-4 text-[16px] leading-relaxed text-text-primary">
              {currentRecommendation}
            </p>
          </div>

          <div className="rounded-[28px] border border-accent/20 bg-white/[0.02] p-4 sm:p-5">
            <div className="flex items-center gap-2 text-text-secondary">
              <Crosshair className="h-4 w-4 text-accent/75" strokeWidth={1.8} />
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Competitive displacement
              </p>
            </div>
            <p className="mt-4 text-[14px] font-medium text-text-primary">
              {topCompetitor?.name ?? "Incumbent platform pressure"}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
              {topCompetitor
                ? `${topCompetitor.strengthAreas.slice(0, 2).join(" · ")}`
                : "The deal is most at risk when incumbent platforms make the customer default to convenience over quality."}
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-text-muted">
              I would not try to out-market the incumbent. I would force a narrower comparison around model quality,
              enterprise governance, and the specific workflow where we win.
            </p>
          </div>
        </aside>
      </div>

      <section id="plans-for-this-week-detail" className="scroll-mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent/75" strokeWidth={2} />
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
            Plans for this week · full detail
          </p>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-surface-muted/50 p-4 sm:p-6">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-text-secondary">
            {plansForThisWeek}
          </p>
          <p className="mt-3 text-[11px] text-text-faint">
            From last week&apos;s notes and where things need to progress.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Account hypotheses I would pressure-test"
          subtitle="These are not claimed facts from a live CRM. They are the initial hypotheses I would bring into discovery, stakeholder mapping, and the first pilot cycle."
        />
        <div className="space-y-4">
          {signals.slice(0, 3).map((signal) => (
            <div
              key={signal.id}
              className="rounded-[22px] border border-accent/20 bg-white/[0.02] px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-text-faint">
                  {signal.priority}
                </span>
                <span className="text-[11px] text-text-faint">
                  {signal.sourceLabel} · {signal.sourceFreshness}
                </span>
              </div>
              <p className="mt-3 text-[15px] font-medium text-text-primary">{signal.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {signal.summary}
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-accent/80">
                {signal.recommendedAction}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
