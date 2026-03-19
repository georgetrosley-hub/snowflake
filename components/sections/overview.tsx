"use client";

import { useMemo, useRef, useCallback, useState } from "react";
import { ArrowRight, Crosshair, CircleDot, Zap, Target } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { SectionId } from "@/components/layout/sidebar";
import { MetricCard } from "@/components/ui/metric-card";
import { SnowflakeLogoIcon } from "@/components/ui/snowflake-logo";
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

function formatMillionCurrency(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return `$${value.toFixed(2)}M`;
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
  const dossierTabs = [
    "Business Overview",
    "Financial Snapshot",
    "10-K / Earnings Signals",
    "Cloud & AI Posture",
    "Competitive Landscape",
    "Snowflake POV",
    "Action Plan",
  ] as const;
  type DossierTab = (typeof dossierTabs)[number];

  const territoryPriorityAccounts = [
    {
      id: "t1-01",
      name: "Tier 1 Account 01",
      industry: "Industry Placeholder",
      why: "Large data estate with high cross-functional demand and executive pressure to improve speed-to-insight.",
      likelyLand: "Governed data serving foundation for a high-visibility business workflow.",
      expansionPath: "Expand into AI-assisted analytics, operational decisioning, and data-sharing products.",
      pressure: "Databricks footprint plus cloud-native status-quo momentum.",
      personas: "CDAO, VP Data Platform, Head of Analytics, Security lead, Procurement.",
      hypothesis: "Team will sponsor a narrow pilot if governance and measurable impact are clear up front.",
      nextMove: "Run executive alignment call and lock 90-day pilot success metrics.",
    },
    {
      id: "t1-02",
      name: "Tier 1 Account 02",
      industry: "Industry Placeholder",
      why: "Clear modernization mandate and fragmented analytics stack creating urgent operational friction.",
      likelyLand: "Unified governed data layer for one mission-critical reporting and planning motion.",
      expansionPath: "Broaden to enterprise-wide data products, AI workloads, and departmental self-service.",
      pressure: "Databricks evaluation active with cloud partner influence.",
      personas: "CIO, Data Engineering Director, Finance analytics leader, Security architect.",
      hypothesis: "Economic buyer will move quickly if we prove consolidation and faster delivery.",
      nextMove: "Secure technical workshop with decision-makers and map incumbent displacement path.",
    },
    {
      id: "t1-03",
      name: "Tier 1 Account 03",
      industry: "Industry Placeholder",
      why: "High-value data assets and strong executive appetite for governed AI deployment at scale.",
      likelyLand: "First workload around governed AI-ready data access for a priority domain team.",
      expansionPath: "Scale to additional domains, partner data exchange, and enterprise AI applications.",
      pressure: "Databricks incumbent plus cloud credits shaping procurement behavior.",
      personas: "Chief Digital Officer, Head of Data Science, Platform owner, Risk and Compliance.",
      hypothesis: "Champion exists if we anchor on risk-controlled speed rather than broad transformation.",
      nextMove: "Identify champion and co-author pilot narrative for steering committee review.",
    },
    {
      id: "t1-04",
      name: "Tier 1 Account 04",
      industry: "Industry Placeholder",
      why: "Large downstream business impact tied to analytics latency and inconsistent governance standards.",
      likelyLand: "Governed performance reporting and workload consolidation for a priority business unit.",
      expansionPath: "Expand into predictive analytics, AI-powered operations, and cross-region data collaboration.",
      pressure: "Databricks technical champions and cloud-native procurement default.",
      personas: "BU President, Head of Data, Enterprise Architect, Information Security, Sourcing.",
      hypothesis: "A tightly scoped business-case pilot can bypass platform politics and accelerate approval.",
      nextMove: "Present value case with timeline, owners, and go-live criteria in next exec readout.",
    },
    {
      id: "t1-05",
      name: "Tier 1 Account 05",
      industry: "Industry Placeholder",
      why: "Active transformation program with budget available but no clear governed platform standard yet.",
      likelyLand: "Initial deployment for secure, shared analytics across key operating teams.",
      expansionPath: "Move into AI productization, external data distribution, and enterprise workload standardization.",
      pressure: "Databricks preferred by engineering and cloud vendor co-sell pressure.",
      personas: "CTO, VP Engineering, Data Governance lead, Line-of-business analytics sponsor.",
      hypothesis: "Cross-functional support increases once we prove governance without slowing delivery.",
      nextMove: "Launch multi-threaded stakeholder plan and convert current interest into pilot commitment.",
    },
  ] as const;
  type PriorityAccount = (typeof territoryPriorityAccounts)[number];

  const [activeDossierId, setActiveDossierId] = useState<PriorityAccount["id"]>(
    territoryPriorityAccounts[0].id
  );
  const [activeDossierTab, setActiveDossierTab] = useState<DossierTab>("Business Overview");

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
  const championCount = stakeholders.filter(
    (stakeholder) => stakeholder.stance === "champion" || stakeholder.stance === "ally"
  ).length;
  const blockedCount = executionItems.filter((item) => item.status === "blocked").length;
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
  const firstPilotValue = formatMillionCurrency(account.estimatedLandValue);
  const expansionPathValue = formatMillionCurrency(account.estimatedExpansionValue);
  const inPlayValue = formatMillionCurrency(pipelineTarget);
  const activeDossierAccount =
    territoryPriorityAccounts.find((priority) => priority.id === activeDossierId) ??
    territoryPriorityAccounts[0];
  const dossierInsights = useMemo(() => {
    const p = activeDossierAccount;
    return {
      business: {
        filings: "Public disclosures indicate enterprise modernization priorities with governance and execution consistency themes.",
        earnings: "Leadership commentary signals pressure for faster delivery and higher productivity from core data initiatives.",
        signals: `Current public signal set points to active transformation motion in ${p.industry}.`,
        inference: `${p.name} likely prioritizes outcomes that improve decision velocity without increasing risk exposure.`,
      },
      financial: {
        filings: "Language in filings supports selective investment tied to measurable business outcomes.",
        earnings: "Earnings framing suggests phased commitments over broad upfront platform changes.",
        signals: "Program cadence and hiring patterns indicate appetite for practical, staged execution.",
        inference: "A narrowly scoped pilot with explicit success criteria is the lowest-friction buying path.",
      },
      earnings10k: {
        filings: "Risk sections typically emphasize execution complexity, governance obligations, and change-management risk.",
        earnings: "Calls emphasize accountability for delivery speed and operational resilience.",
        signals: "Stakeholder ownership appears cross-functional across business, platform, and risk teams.",
        inference: "Win probability increases when governance and speed are solved in the same first motion.",
      },
      cloudAi: {
        filings: "Public messaging suggests cloud modernization with control and compliance as baseline requirements.",
        earnings: "AI priorities are framed as practical productivity gains, not speculative experimentation.",
        signals: `Current hypothesis indicates ${p.pressure.toLowerCase()}.`,
        inference: "Do not assume exact spend or vendor footprint; lead with governed execution posture instead.",
      },
      competitive: {
        filings: "Incumbent and default-path inertia are likely embedded in current operating models.",
        earnings: "Leadership appears open to alternatives that reduce complexity while preserving control.",
        signals: `Observed pressure today: ${p.pressure}`,
        inference: "Position against Databricks on enterprise governance, cross-functional adoption, and measurable workflow outcomes.",
      },
      snowflakePov: {
        bestLand: p.likelyLand,
        expansionPath: p.expansionPath,
        positioningVsDatabricks:
          "Compete on governed enterprise execution: faster path to measurable business outcomes with lower cross-team coordination risk.",
        filings: "Governance and execution themes support a control-first commercial entry.",
        earnings: "Productivity themes support outcomes-led pilot economics.",
        signals: `Public signals and account hypothesis indicate urgency around ${p.nextMove.toLowerCase()}.`,
        inference: "Land narrow, prove impact, then expand through adjacent workloads.",
      },
      actionPlan: {
        discoveryAngles: [
          "Where does delayed data-to-decision flow create the highest business cost right now?",
          "What governance blockers are slowing deployment confidence across teams?",
          "Which 90-day result would justify expansion sponsorship from leadership?",
        ],
        talkTracks: [
          "We can improve delivery speed without trading away governance.",
          "Start with one workflow that leadership already cares about and prove value fast.",
          "This is a territory execution decision, not just a tooling preference debate.",
        ],
        nextSteps: [
          p.nextMove,
          "Run a cross-functional discovery session with business, platform, and security.",
          "Lock pilot scope, success metrics, and executive review cadence.",
        ],
        filings: "Control and execution language supports a disciplined pilot path.",
        earnings: "Outcome accountability supports a measurable first-motion narrative.",
        signals: "Public indicators support immediate qualification and stakeholder threading.",
        inference: "Move now while evaluation criteria are still being shaped.",
      },
    };
  }, [activeDossierAccount]);

  const renderLabeledInsight = (
    label: "From filings" | "From earnings" | "Public signals" | "Inference",
    text: string,
    emphasize = false
  ) => (
    <div
      className={`rounded-xl p-3 ${
        emphasize
          ? "border border-accent/25 bg-accent/[0.06]"
          : "border border-surface-border/50 bg-surface-muted/30"
      }`}
    >
      <p
        className={`text-[10px] uppercase tracking-[0.1em] ${
          emphasize ? "text-accent/90" : "text-text-faint"
        }`}
      >
        {label}
      </p>
      <p className="mt-1.5 text-[12px] text-text-secondary">{text}</p>
    </div>
  );

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero */}
      <div className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SnowflakeLogoIcon size={32} className="shrink-0 opacity-95" />
            <div>
              <h1 className="text-[18px] font-semibold tracking-tight text-text-primary sm:text-[20px]">
                How I Would Operate and Expand This Snowflake Territory
              </h1>
              <p className="mt-0.5 text-[13px] text-text-muted">
                A practical system for prioritizing accounts, tracking market signals, and converting insight into action.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-text-secondary">
          This territory view is built for execution cadence: clear priorities, active deal movement, and disciplined expansion planning.
        </p>
      </div>

      {/* Territory priorities */}
      <section className="space-y-4">
        <SectionHeader
          title="Territory priorities"
          subtitle="Top five Tier 1 accounts I would run immediately, with clear land motion, expansion thesis, and next move."
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {territoryPriorityAccounts.map((priority) => (
            <article
              key={priority.id}
              className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">{priority.name}</h3>
                  <p className="mt-0.5 text-[12px] text-text-muted">{priority.industry}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-accent/30 bg-accent/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-accent">
                    Tier 1
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-faint">
                    Immediate Focus
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-[12px] leading-relaxed">
                <p><span className="font-semibold text-text-primary">Why This Account Matters:</span> <span className="text-text-secondary">{priority.why}</span></p>
                <p><span className="font-semibold text-text-primary">Likely Land:</span> <span className="text-text-secondary">{priority.likelyLand}</span></p>
                <p><span className="font-semibold text-text-primary">Expansion Path:</span> <span className="text-text-secondary">{priority.expansionPath}</span></p>
                <p><span className="font-semibold text-text-primary">Competitive Pressure:</span> <span className="text-text-secondary">{priority.pressure}</span></p>
                <p><span className="font-semibold text-text-primary">Key Personas:</span> <span className="text-text-secondary">{priority.personas}</span></p>
                <p><span className="font-semibold text-text-primary">Current Hypothesis:</span> <span className="text-text-secondary">{priority.hypothesis}</span></p>
                <p><span className="font-semibold text-text-primary">Next Best Move:</span> <span className="text-text-secondary">{priority.nextMove}</span></p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveDossierId(priority.id);
                  setActiveDossierTab("Business Overview");
                  document
                    .getElementById("account-dossier-view")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="mt-4 rounded-lg border border-accent/30 bg-accent/[0.08] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/[0.14]"
              >
                Open Account Dossier
              </button>
            </article>
          ))}
        </div>
      </section>

      <section
        id="account-dossier-view"
        className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Account Dossier
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-text-primary">
              {activeDossierAccount.name}
            </h2>
            <p className="mt-1 text-[12px] text-text-muted">
              {activeDossierAccount.industry} · Tier 1 · Immediate Focus
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {dossierTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveDossierTab(tab)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                activeDossierTab === tab
                  ? "border border-accent/30 bg-accent/[0.10] text-accent"
                  : "border border-surface-border/50 bg-surface-muted/40 text-text-muted hover:border-accent/20 hover:text-text-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeDossierTab === "Business Overview" && (
          <div className="mt-5 space-y-3">
            {renderLabeledInsight("From filings", dossierInsights.business.filings)}
            {renderLabeledInsight("From earnings", dossierInsights.business.earnings)}
            {renderLabeledInsight("Public signals", dossierInsights.business.signals)}
            {renderLabeledInsight("Inference", dossierInsights.business.inference, true)}
          </div>
        )}

        {activeDossierTab === "Financial Snapshot" && (
          <div className="mt-5 space-y-3">
            {renderLabeledInsight("From filings", dossierInsights.financial.filings)}
            {renderLabeledInsight("From earnings", dossierInsights.financial.earnings)}
            {renderLabeledInsight("Public signals", dossierInsights.financial.signals)}
            {renderLabeledInsight("Inference", dossierInsights.financial.inference, true)}
          </div>
        )}

        {activeDossierTab === "10-K / Earnings Signals" && (
          <div className="mt-5 space-y-3">
            {renderLabeledInsight("From filings", dossierInsights.earnings10k.filings)}
            {renderLabeledInsight("From earnings", dossierInsights.earnings10k.earnings)}
            {renderLabeledInsight("Public signals", dossierInsights.earnings10k.signals)}
            {renderLabeledInsight("Inference", dossierInsights.earnings10k.inference, true)}
          </div>
        )}

        {activeDossierTab === "Cloud & AI Posture" && (
          <div className="mt-5 space-y-3">
            {renderLabeledInsight("From filings", dossierInsights.cloudAi.filings)}
            {renderLabeledInsight("From earnings", dossierInsights.cloudAi.earnings)}
            {renderLabeledInsight("Public signals", dossierInsights.cloudAi.signals)}
            {renderLabeledInsight("Inference", dossierInsights.cloudAi.inference, true)}
          </div>
        )}

        {activeDossierTab === "Competitive Landscape" && (
          <div className="mt-5 space-y-3">
            {renderLabeledInsight("From filings", dossierInsights.competitive.filings)}
            {renderLabeledInsight("From earnings", dossierInsights.competitive.earnings)}
            {renderLabeledInsight("Public signals", dossierInsights.competitive.signals)}
            {renderLabeledInsight("Inference", dossierInsights.competitive.inference, true)}
          </div>
        )}

        {activeDossierTab === "Snowflake POV" && (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-accent/90">Best Land</p>
              <p className="mt-1.5 text-[12px] text-text-secondary">{dossierInsights.snowflakePov.bestLand}</p>
            </div>
            <div className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-text-faint">Expansion Path</p>
              <p className="mt-1.5 text-[12px] text-text-secondary">{dossierInsights.snowflakePov.expansionPath}</p>
            </div>
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-rose-300/90">Positioning vs Databricks</p>
              <p className="mt-1.5 text-[12px] text-text-secondary">{dossierInsights.snowflakePov.positioningVsDatabricks}</p>
            </div>
            {renderLabeledInsight("From filings", dossierInsights.snowflakePov.filings)}
            {renderLabeledInsight("From earnings", dossierInsights.snowflakePov.earnings)}
            {renderLabeledInsight("Public signals", dossierInsights.snowflakePov.signals)}
            {renderLabeledInsight("Inference", dossierInsights.snowflakePov.inference, true)}
          </div>
        )}

        {activeDossierTab === "Action Plan" && (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-text-faint">Discovery Angles</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
                {dossierInsights.actionPlan.discoveryAngles.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-text-faint">Talk Tracks</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
                {dossierInsights.actionPlan.talkTracks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-accent/90">Next Steps</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
                {dossierInsights.actionPlan.nextSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {renderLabeledInsight("From filings", dossierInsights.actionPlan.filings)}
            {renderLabeledInsight("From earnings", dossierInsights.actionPlan.earnings)}
            {renderLabeledInsight("Public signals", dossierInsights.actionPlan.signals)}
            {renderLabeledInsight("Inference", dossierInsights.actionPlan.inference, true)}
          </div>
        )}

        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
          <p className="text-[10px] text-text-faint">
            Fact/inference labels separate observed public context from strategy interpretation. No exact cloud spend or vendor usage values are asserted.
          </p>
        </div>
      </section>

      {/* Territory execution snapshot */}
      <section className="space-y-4">
        <SectionHeader
          title="Territory execution snapshot"
          subtitle="Current wedge economics, stakeholder coverage, and expansion posture across the patch."
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Revenue in motion"
            value={inPlayValue ?? "Priority accounts scoped"}
            subtitle={inPlayValue ? "Near-term land + expansion focus" : "Current week is focused on qualification and wedge definition"}
          />
          <MetricCard
            label="First pilot"
            value={firstPilotValue ?? "Pilot scope in progress"}
            subtitle={account.firstWedge}
          />
          <MetricCard
            label="Expansion path"
            value={expansionPathValue ?? "Expansion thesis defined"}
            subtitle={account.topExpansionPaths[0]}
          />
          <MetricCard
            label="Deal coverage"
            value={`${championCount} active threads`}
            subtitle={`${blockedCount} blocker${blockedCount === 1 ? "" : "s"} requiring active management`}
          />
        </div>
      </section>

      {/* Account execution */}
      <section className="rounded-2xl border border-surface-border bg-surface-elevated p-4 sm:p-6 shadow-elevated">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              {todayLabel} · {account.name}
            </p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
              Account execution
            </h1>
          </div>
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
              {staleItems.length} stale workstream{staleItems.length === 1 ? "" : "s"}
            </div>
          )}
        </div>
        <p className="mt-3 text-[12px] text-text-muted">{dealHealth.reason}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => document.getElementById("plans-for-this-week-detail")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex min-h-[88px] touch-target flex-col justify-start rounded-xl border border-accent/25 bg-surface-muted/50 px-4 py-3.5 text-left transition-colors active:bg-surface-muted/70 hover:bg-surface-muted/70 hover:border-accent/40 sm:min-h-0"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">This week&apos;s operating priorities</p>
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
            onClick={() => onSectionChange?.("first90AndFieldKit")}
            className="flex min-h-[88px] touch-target flex-col justify-center rounded-xl border border-accent/25 bg-surface-muted/50 px-4 py-4 text-left transition-colors active:bg-surface-muted/70 hover:bg-surface-muted/70 hover:border-accent/40 sm:min-h-0 sm:py-3.5"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Last account update</p>
            </div>
            <p className="mt-2 text-[15px] font-bold text-text-primary">
              {lastUpdate?.title ?? "Daily account reset"}
            </p>
            <p className="mt-0.5 text-[13px] text-text-secondary">{lastUpdate?.createdAt ?? "Today"}</p>
          </button>
          <button
            type="button"
            onClick={() => onSectionChange?.("first90AndFieldKit")}
            className="flex min-h-[88px] touch-target flex-col justify-center rounded-xl border border-accent/25 bg-surface-muted/50 px-4 py-4 text-left transition-colors active:bg-surface-muted/70 hover:bg-surface-muted/70 hover:border-accent/40 sm:min-h-0 sm:py-3.5"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent">Today&apos;s must-win move</p>
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

      {/* This week's operating priorities */}
      <section id="plans-for-this-week-detail" className="scroll-mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent/75" strokeWidth={2} />
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
            This week&apos;s operating priorities
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

      {/* Action-oriented insights */}
      <section className="space-y-4">
        <SectionHeader
          title="Action-oriented insights"
          subtitle="Signals and competitive context that shape account strategy, urgency, and next actions."
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="rounded-[28px] border border-accent/20 bg-white/[0.02] p-4 sm:p-5">
            <div className="flex items-center gap-2 text-text-secondary">
              <Crosshair className="h-4 w-4 text-accent/75" strokeWidth={1.8} />
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Competitive pressure point
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
              Win by forcing a narrow comparison around enterprise governance, measurable outcomes, and the exact workflow where the customer feels pain.
            </p>
          </div>
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
        </div>
      </section>

      {/* Platform narrative (lower on page) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <section className="min-w-0 rounded-[28px] border border-accent/20 bg-white/[0.02] p-4 sm:p-6">
          <SectionHeader
            title="Platform narrative and account strategy"
            subtitle="How I would position Snowflake in this account after priorities, stakeholders, and operating plan are clear."
          />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Land motion</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">{account.firstWedge}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                Keep the first sale narrow, measurable, and sponsor-friendly. The first win should earn the right to expand.
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Champion building</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {champion?.title ?? "Likely functional champion"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {champion?.note ?? "Find the operator with urgency, cross-functional influence, and clear upside from a successful pilot."}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Pilot strategy</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {firstDecision?.title ?? "Define the first pilot"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {firstDecision?.detail ?? "Define owners, timeline, success metrics, and required governance before broad executive escalation."}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Expansion path</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {expansionItem?.title ?? account.topExpansionPaths[0]}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                Name the second motion early so leadership sees a durable platform decision, not a one-off experiment.
              </p>
            </div>
          </div>
        </section>
        <aside className="min-w-0 space-y-4">
          <div className="rounded-[28px] border border-accent/15 bg-accent/[0.05] p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <SnowflakeLogoIcon size={16} className="opacity-90" />
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent/80">
                Current account recommendation
              </p>
            </div>
            <p className="mt-4 text-[16px] leading-relaxed text-text-primary">
              {currentRecommendation}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
