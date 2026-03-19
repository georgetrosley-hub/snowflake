"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpenCheck, RefreshCcw } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type {
  Account,
  Competitor,
  AccountSignal,
  Stakeholder,
  ExecutionItem,
  AccountUpdate,
  WorkspaceDraft
} from "@/types";
import type { DealHealthSummary } from "@/lib/deal-health";

function formatUpdatedAt(iso?: string): string {
  if (!iso) return "Not refreshed yet";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Not refreshed yet";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
  onSelectAccount: (accountId: string) => void;
  onUpdateWorkspaceField: (field: keyof WorkspaceDraft, value: string) => void;
  onAddAccountUpdate: (
    title: string,
    note: string,
    tag: AccountUpdate["tag"]
  ) => void;
}

export function Overview({
  account,
  onSelectAccount,
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

  const territoryPriorityAccounts = useMemo(() => [
    {
      id: "us-financial-technology",
      name: "U.S. Financial Technology",
      industry: "Financial Technology",
      isPrimary: true,
      primaryLabel: "Primary Expansion Focus",
      status: "Existing Snowflake customer (mission-critical footprint to validate)",
      why: "This is the highest-confidence expansion opportunity in the territory. Scale, regulatory scrutiny, and operational risk make governance non-negotiable — if Snowflake is already present, expanding into additional regulated workflows can drive durable, multi-team consumption.",
      likelyLand: "Drive the next expansion through a governed, high-control workflow (likely regulatory reporting or risk analytics) where auditability and lineage are required — establish Snowflake as the control plane before expanding further.",
      expansionPath: "Expand from that initial workload into adjacent reporting, data sharing across entities, and AI-adjacent decision workflows where trust and governance are more critical than experimentation speed.",
      pressure: "Snowflake may be present but not fully platformized. If Databricks is entrenched in ML or engineering workflows, expansion should start in governed analytics and data sharing — win the control narrative, then expand outward.",
      personas: "CDO, Head of Data Engineering, Risk/Compliance leadership, Analytics leadership",
      hypothesis: "The constraint here is unlikely to be capability — it’s alignment. Expansion depends on connecting governance, ownership, and budget across teams that are currently operating independently.",
      pov: "If Snowflake is already trusted in one workflow, the fastest path to expansion is replicating that pattern in another regulated use case — not introducing net-new use cases too early.",
      nextMove: "Identify one executive-visible regulatory or reporting workflow where Snowflake can expand immediately, confirm who owns that outcome, and align expansion to a concrete business requirement — then use that as the repeatable pattern across additional teams.",
      validateFirst: "Current Snowflake footprint and where it is actually used day-to-day, which teams are active, where Databricks or other tools are embedded, active regulatory or reporting initiatives, and who owns both governance and budget decisions.",
    },
    {
      id: "sagent-lending",
      name: "Sagent Lending",
      industry: "Lending Technology",
      status: "Active account with expansion opportunity",
      isPrimary: false,
      why: "Lending is operationally intense: data quality, timeliness, and accountability are directly tied to customer outcomes and operational risk. Expansion wins here tend to come from standardizing execution in the workflows that ops leaders can feel.",
      likelyLand: "Expand Snowflake usage in a lending operations workflow where cycle time and reconciliation pain are real, then use that momentum to pull adjacent teams onto a common governed layer.",
      expansionPath: "Increase consumption by widening adoption across operations analytics, reporting, and data engineering where Snowflake can remove handoffs and reduce workflow friction.",
      pressure: "Likely tension: ownership is split between product/ops and platform teams; Databricks can stay sticky in engineering-led areas unless expansion is anchored in an ops-owned workflow.",
      personas: "CIO/CTO, Data Platform leader, Product/Operations analytics leader, Security/Governance owner.",
      hypothesis: "If Snowflake is currently used by one team but not platformized, the quickest expansion is to make one workflow unmistakably better — and use that credibility to expand team coverage.",
      pov: "Expansion is more likely constrained by fragmented ownership than lack of use cases; I’ll win by aligning ops + platform on one measurable workflow and using it as the template for the next two.",
      nextMove: "Force clarity on who owns the business workflow vs who owns the platform, then drive a decision on one ops-critical workload to expand next — not a general ‘platform evaluation’ conversation.",
      validateFirst: "Current Snowflake usage patterns, which teams are active vs adjacent, where Databricks or other tools are embedded, active data/analytics/AI initiatives, and budget ownership plus buying path.",
    },
    {
      id: "ciena-corp",
      name: "Ciena Corp",
      industry: "Networking Technology",
      status: "Existing deployment, scope to be mapped",
      isPrimary: false,
      why: "Enterprise networking organizations typically have dispersed data ownership across product, operations, and go-to-market teams. That fragmentation creates expansion opportunity if Snowflake can become the governed shared layer across domains.",
      likelyLand: "Expand Snowflake into a cross-functional domain where multiple teams touch the same data and governance friction slows decisions — then build repeatable patterns for the next domain.",
      expansionPath: "Drive adoption via shared data products, stronger governance standards, and operational analytics that cut across silos (product, supply chain, services, and commercial).",
      pressure: "Likely tension: technical teams may default to existing engineering tooling; Snowflake expansion wins when it’s positioned as the shared, governed layer that reduces cross-team friction.",
      personas: "Chief Digital/Data leadership, Data Science leadership, Platform owner, Security/Governance.",
      hypothesis: "This is the account where expansion is often ‘platformization by consensus’ — if ownership is unclear, Snowflake stays local to one team and the rest of the org routes around it.",
      pov: "If Snowflake is isolated to one org pocket, I’ll expand by making it the default governed ‘exchange’ layer across domains — data products, sharing, and trust — not by trying to rip out engineering tools.",
      nextMove: "Identify whether Snowflake is platformized or isolated today, then align the platform owner and a cross-functional business leader on one domain expansion decision that forces shared ownership and repeatable rollout.",
      validateFirst: "Current Snowflake usage patterns and org coverage, where Databricks or other tools are embedded, active analytics/AI initiatives tied to business priorities, and decision ownership plus buying process.",
    },
  ] as const, []);
  type PriorityAccount = (typeof territoryPriorityAccounts)[number];

  const [activeDossierTab, setActiveDossierTab] = useState<DossierTab>("Business Overview");
  const [activeBriefingWindow, setActiveBriefingWindow] = useState<"24h" | "7d" | "30d" | "12m">("24h");
  const [briefingOutputTitleOverride, setBriefingOutputTitleOverride] = useState<string | null>(null);
  const [briefingOutput, setBriefingOutput] = useState<{
    whatChanged: string;
    whyItMatters: string;
    snowflakeImplication: string;
    databricksImplication: string;
    recommendedAction: string;
  } | null>(null);
  const [accountLastUpdated, setAccountLastUpdated] = useState<Record<PriorityAccount["id"], string>>({
    "us-financial-technology": "",
    "sagent-lending": "",
    "ciena-corp": "",
  });
  const [dossierLastUpdated, setDossierLastUpdated] = useState<string>("");
  const [territoryLastUpdated, setTerritoryLastUpdated] = useState<string>("");
  const [refreshingAccountId, setRefreshingAccountId] = useState<PriorityAccount["id"] | null>(null);
  const [refreshingDossier, setRefreshingDossier] = useState(false);
  const [refreshingTerritory, setRefreshingTerritory] = useState(false);
  const [dossierFocus, setDossierFocus] = useState(false);
  const dossierFocusTimeoutRef = useRef<number | null>(null);
  const selectedAccountId =
    territoryPriorityAccounts.find((p) => p.id === account.id)?.id ??
    territoryPriorityAccounts[0].id;

  useEffect(() => {
    // Clear derived briefing content when selected account changes
    // so the panel reflects the current global account context.
    setBriefingOutput(null);
    setBriefingOutputTitleOverride(null);

    // Optional: subtle focus effect on the dossier section.
    setDossierFocus(true);
    if (dossierFocusTimeoutRef.current) {
      window.clearTimeout(dossierFocusTimeoutRef.current);
    }
    dossierFocusTimeoutRef.current = window.setTimeout(() => {
      setDossierFocus(false);
    }, 650);
  }, [selectedAccountId]);

  useEffect(() => {
    return () => {
      if (dossierFocusTimeoutRef.current) {
        window.clearTimeout(dossierFocusTimeoutRef.current);
      }
    };
  }, []);
  const activeDossierAccount =
    territoryPriorityAccounts.find((priority) => priority.id === selectedAccountId) ??
    territoryPriorityAccounts[0];
  const activeBriefingAccount = activeDossierAccount;
  const briefingByAccount: Record<
    PriorityAccount["id"],
    Record<
      "24h" | "7d" | "30d" | "12m",
      {
        keySignals: string;
        whatChanged: string;
        whyItMatters: string;
        snowflakeImplication: string;
        databricksImplication: string;
        nextBestMove: string;
      }
    >
  > = useMemo(() => ({
    "us-financial-technology": {
      "24h": {
        keySignals: "Public signals suggest active modernization priorities and tighter execution expectations from leadership.",
        whatChanged: "Likely decision ownership is converging across business, platform, and governance stakeholders.",
        whyItMatters: "This is the moment to shape evaluation criteria around business outcomes and control.",
        snowflakeImplication: "Lead with one governed business workflow where speed and trust both matter.",
        databricksImplication: "Databricks remains a risk if evaluation remains tooling-centric.",
        nextBestMove: "Confirm who owns governance vs who controls budget, then align on one regulated workflow to expand next and schedule an exec checkpoint to lock success criteria.",
      },
      "7d": {
        keySignals: "Signals indicate stronger urgency around delivery speed and risk-controlled execution.",
        whatChanged: "The account appears to be moving from open-ended assessment to practical decision framing.",
        whyItMatters: "Early POV quality now directly affects competitive position.",
        snowflakeImplication: "Frame Snowflake as the fastest governed path to production impact.",
        databricksImplication: "Incumbent engineering preference can harden if left unchallenged.",
        nextBestMove: "Build workflow-specific scorecard that ties platform choice to measurable operating outcomes.",
      },
      "30d": {
        keySignals: "Recurring checkpoints suggest formalized buying motion with governance influence.",
        whatChanged: "Risk and control stakeholders likely moved into core decision path.",
        whyItMatters: "Selection will favor practical production readiness over pure feature comparison.",
        snowflakeImplication: "Differentiate on enterprise governance with fast execution.",
        databricksImplication: "Competitive pressure increases if business proof is weak.",
        nextBestMove: "Run a joint business + platform + security working session to lock one expansion workload, guardrails, and a path to widen adoption across teams.",
      },
      "12m": {
        keySignals: "Longer-horizon signals point to platform standardization and AI operating-model maturity.",
        whatChanged: "Decision criteria are likely shifting from point capabilities to durable outcomes.",
        whyItMatters: "First land quality will determine expansion ceiling.",
        snowflakeImplication: "Win narrow first motion, then expand via adjacent governed workloads.",
        databricksImplication: "Incumbent inertia persists without early executive sponsorship.",
        nextBestMove: "Define 12-month land-to-expand sequence before pilot launch.",
      },
    },
    "sagent-lending": {
      "24h": {
        keySignals: "Public signals indicate active operating pressure and focus on delivery simplification.",
        whatChanged: "Current friction is likely now framed as business risk, not technical debt.",
        whyItMatters: "Economic buyer attention is likely increasing.",
        snowflakeImplication: "Position Snowflake as governed consolidation path with practical time-to-value.",
        databricksImplication: "Databricks gains where conversation stays engineering-first.",
        nextBestMove: "Quantify one high-cost workflow delay and tie first land to that outcome.",
      },
      "7d": {
        keySignals: "Modernization language suggests platform rationalization is now explicit.",
        whatChanged: "Evaluation appears to be moving from tools to operating-model fit.",
        whyItMatters: "Outcome framing now matters more than feature parity.",
        snowflakeImplication: "Lead with measured operating improvement and controlled rollout.",
        databricksImplication: "Incumbent familiarity remains a durable competitor lever.",
        nextBestMove: "Publish a one-page expansion charter: owner, workflow, decision path, and what ‘good’ looks like — then get it sponsored by the business leader who feels the pain.",
      },
      "30d": {
        keySignals: "Stakeholder map likely expanded to include finance and procurement oversight.",
        whatChanged: "Buying process appears formalized with clearer risk/return criteria.",
        whyItMatters: "Business-case clarity will likely outweigh technical novelty.",
        snowflakeImplication: "Use KPI-linked business case as primary selling asset.",
        databricksImplication: "Cloud and incumbent momentum can sway procurement without strong business proof.",
        nextBestMove: "Lead executive session on KPI-linked pilot outcomes and approval sequence.",
      },
      "12m": {
        keySignals: "Trajectory suggests phased consolidation with broader AI-readiness ambition.",
        whatChanged: "Intent appears to be shifting from tactical fixes to platform standards.",
        whyItMatters: "Expansion opportunity is significant if first land creates repeatable trust.",
        snowflakeImplication: "Design first land to be reusable across adjacent teams.",
        databricksImplication: "Entrenched defaults harden without early executive win.",
        nextBestMove: "Pre-wire expansion playbook with two follow-on workloads before first signature.",
      },
    },
    "ciena-corp": {
      "24h": {
        keySignals: "Public signals suggest active AI interest with governance and control requirements.",
        whatChanged: "Pilot appetite likely improved if risk controls are explicit.",
        whyItMatters: "Timing favors governed-first land positioning.",
        snowflakeImplication: "Position first motion as AI-ready data execution with enterprise safeguards.",
        databricksImplication: "Technical teams can default to incumbent patterns without business-led wedge.",
        nextBestMove: "Identify the platform owner and one cross-functional business sponsor, then agree on a domain expansion decision and the governance requirements to take it live.",
      },
      "7d": {
        keySignals: "Stakeholders appear to be converging around practical use-case sequencing.",
        whatChanged: "Conversation likely shifted from broad AI ambition to deployment requirements.",
        whyItMatters: "Buying motion is becoming concrete enough for focused commercial planning.",
        snowflakeImplication: "Frame Snowflake as governed execution layer for business-ready AI.",
        databricksImplication: "Databricks retains influence where evaluation stays model/engineering oriented.",
        nextBestMove: "Run discovery on deployment blockers, ownership model, and governance acceptance criteria.",
      },
      "30d": {
        keySignals: "Cross-functional coordination likely increasing around risk and rollout cadence.",
        whatChanged: "Security/compliance likely moved into core decision path.",
        whyItMatters: "Platform choice will be determined by production readiness, not prototypes.",
        snowflakeImplication: "Emphasize controlled deployment velocity with enterprise governance.",
        databricksImplication: "Competitive threat rises if prototype success is confused with production readiness.",
        nextBestMove: "Co-author production pilot plan with security stakeholder sponsorship and clear operating metrics.",
      },
      "12m": {
        keySignals: "Longer-term posture indicates scaled AI adoption tied to governed data foundations.",
        whatChanged: "Roadmap likely shifting toward reusable operating patterns.",
        whyItMatters: "Landing first governed workflow can unlock broader expansion.",
        snowflakeImplication: "Build expansion around repeatable domain rollouts and shared governance model.",
        databricksImplication: "Technical incumbency can block standardization without executive proof.",
        nextBestMove: "Define multi-domain expansion blueprint aligned to annual planning cycle.",
      },
    },
  }), []);
  const activeBriefing = briefingByAccount[activeBriefingAccount.id][activeBriefingWindow];
  const buildAccountBrief = useCallback(() => {
    setBriefingOutputTitleOverride(`${activeBriefingAccount.name} · ${activeBriefingWindow} Account Brief`);
    setBriefingOutput({
      whatChanged: activeBriefing.whatChanged,
      whyItMatters: activeBriefing.whyItMatters,
      snowflakeImplication: activeBriefing.snowflakeImplication,
      databricksImplication: activeBriefing.databricksImplication,
      recommendedAction: activeBriefing.nextBestMove,
    });
  }, [activeBriefing, activeBriefingAccount.name, activeBriefingWindow]);

  const buildTerritoryBrief = useCallback(() => {
    const windows = briefingByAccount;
    const allAccounts = territoryPriorityAccounts.map((a) => a.name).join(", ");
    setBriefingOutputTitleOverride(`Full Territory Brief · ${activeBriefingWindow}`);
    setBriefingOutput({
      whatChanged: `Priority-account motion across ${allAccounts} shifted toward clearer sponsor ownership and tighter evaluation criteria in the ${activeBriefingWindow} window.`,
      whyItMatters: "The territory is moving from discovery to decision framing; this is where evaluation rules and win rates are set.",
      snowflakeImplication:
        "Lead with governed execution in high-urgency workflows and keep expansion narrative explicit from the first pilot.",
      databricksImplication:
        "Databricks retains default technical momentum where business workflow outcomes are not explicitly tied to the evaluation.",
      recommendedAction:
        "Run one weekly executive cadence across the three priority accounts: confirm sponsor, lock pilot criteria, and pre-wire next expansion workload.",
    });
    setTerritoryLastUpdated(new Date().toISOString());
    void windows;
  }, [activeBriefingWindow, territoryPriorityAccounts, briefingByAccount]);

  const refreshTerritoryBrief = useCallback(async () => {
    setRefreshingTerritory(true);
    await new Promise((resolve) => setTimeout(resolve, 950));
    const nowIso = new Date().toISOString();
    setTerritoryLastUpdated(nowIso);
    setRefreshingTerritory(false);
  }, []);

  const copyNotebookPrompt = useCallback(async () => {
    const source = briefingOutput ?? {
      whatChanged: activeBriefing.whatChanged,
      whyItMatters: activeBriefing.whyItMatters,
      snowflakeImplication: activeBriefing.snowflakeImplication,
      databricksImplication: activeBriefing.databricksImplication,
      recommendedAction: activeBriefing.nextBestMove,
    };
    const prompt = [
      `Territory Briefing`,
      `Account: ${activeBriefingAccount.name}`,
      `Window: ${activeBriefingWindow}`,
      ``,
      `What changed: ${source.whatChanged}`,
      `Why it matters: ${source.whyItMatters}`,
      `Snowflake implication: ${source.snowflakeImplication}`,
      `Databricks implication: ${source.databricksImplication}`,
      `Recommended action: ${source.recommendedAction}`,
      ``,
      `Rewrite this in executive format with bullet points and keep it under 180 words.`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard may be unavailable in some environments.
    }
  }, [activeBriefing, activeBriefingAccount.name, activeBriefingWindow, briefingOutput]);

  const exportPdf = useCallback(() => {
    window.print();
  }, []);
  const weeklyOperatingPriorities = useMemo(() => [
    {
      title: "Secure pilot scope and sponsor alignment",
      whyNow: "Decision criteria are still being shaped this week.",
      targetAccount: "U.S. Financial Technology",
      expectedOutcome: "Approved 90-day pilot charter with success metrics.",
    },
    {
      title: "Run consolidation discovery on highest-friction workflow",
      whyNow: "Business pain is now explicit and sponsor-visible.",
      targetAccount: "Sagent Lending",
      expectedOutcome: "Validated land use case with quantified urgency.",
    },
    {
      title: "Lock governance path for AI-adjacent first deployment",
      whyNow: "Security stakeholders are active early in this cycle.",
      targetAccount: "Ciena Corp",
      expectedOutcome: "Agreed deployment guardrails and approval path.",
    },
  ] as const, []);
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("snowflake-territory-intelligence-state");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        accountLastUpdated?: Record<PriorityAccount["id"], string>;
        dossierLastUpdated?: string;
        territoryLastUpdated?: string;
        briefingOutputTitle?: string;
        briefingOutput?: typeof briefingOutput;
      };
      if (parsed.accountLastUpdated) setAccountLastUpdated(parsed.accountLastUpdated);
      if (parsed.dossierLastUpdated) setDossierLastUpdated(parsed.dossierLastUpdated);
      if (parsed.territoryLastUpdated) setTerritoryLastUpdated(parsed.territoryLastUpdated);
    } catch {
      // Keep defaults if persisted state cannot be parsed.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "snowflake-territory-intelligence-state",
        JSON.stringify({
          accountLastUpdated,
          dossierLastUpdated,
          territoryLastUpdated,
        })
      );
    } catch {
      // Ignore persistence errors.
    }
  }, [accountLastUpdated, dossierLastUpdated, territoryLastUpdated]);

  const refreshAccount = useCallback(
    async (accountId: PriorityAccount["id"]) => {
      setRefreshingAccountId(accountId);
      await new Promise((resolve) => setTimeout(resolve, 850));
      const nowIso = new Date().toISOString();
      setAccountLastUpdated((prev) => ({ ...prev, [accountId]: nowIso }));
      setRefreshingAccountId(null);
    },
    []
  );

  const refreshDossierAnalysis = useCallback(async () => {
    setRefreshingDossier(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const nowIso = new Date().toISOString();
    setDossierLastUpdated(nowIso);
    setRefreshingDossier(false);
  }, []);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* SECTION 1: HERO */}
      <div className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <h1 className="text-[20px] font-semibold tracking-tight text-text-primary sm:text-[24px]">
          3 Priority Accounts. Existing Footprint. Expansion-First Execution.
        </h1>
        <p className="mt-2 text-[13px] text-text-muted">
          This is a focused Snowflake territory plan built around three existing customer accounts I would prioritize first: U.S. Financial Technology, Sagent Lending, and Ciena Corp. I am stepping into an existing footprint, and the objective is to expand usage, increase consumption, and broaden Snowflake adoption across teams.
        </p>
        <p className="mt-2 text-[12px] text-text-secondary">
          Expansion is driven by new workloads and increased usage within existing ones.
        </p>
        <p className="mt-3 text-[12px] text-text-secondary">
          Built to reflect how strong enterprise reps actually operate when taking over live accounts: footprint mapping, expansion planning, execution discipline, and cross-team adoption growth.
        </p>
        <p className="mt-3 rounded-lg border border-surface-border/50 bg-surface-muted/30 px-3 py-2 text-[11px] text-text-muted">
          Built using public information and operator assumptions. Current consumption, team-level usage, active opportunities, and competitor depth should be validated quickly after territory transition.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => document.getElementById("territory-priorities")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-lg border border-accent/30 bg-accent/[0.08] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/[0.14]"
          >
            View Priority Accounts
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("execution-model")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="rounded-lg border border-surface-border/60 bg-surface-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary"
          >
            Review Execution Model
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <SectionHeader
          title="Priority Accounts"
          subtitle="These are the first three existing Snowflake accounts I would focus on expanding."
        />
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <article
            className={`rounded-xl p-3 lg:col-span-2 ${
              selectedAccountId === "us-financial-technology"
                ? "border border-accent/45 bg-accent/[0.08]"
                : "border border-accent/25 bg-accent/[0.03] opacity-85"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-[14px] font-semibold text-text-primary">U.S. Financial Technology</p>
              <span className="rounded-full border border-accent/35 bg-accent/[0.10] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-accent">
                Primary Expansion Focus
              </span>
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-text-faint">Status: existing Snowflake customer (mission-critical footprint to validate)</p>
            <p className="mt-2 text-[12px] text-text-secondary">
              Expansion focus: make Snowflake the governed shared layer across risk, compliance, and analytics teams — then widen adoption into adjacent workflows.
            </p>
          </article>
          <article
            className={`rounded-xl border bg-surface-muted/30 p-3 ${
              selectedAccountId === "sagent-lending"
                ? "border-accent/30"
                : "border-surface-border/50 opacity-85"
            }`}
          >
            <p className="text-[14px] font-semibold text-text-primary">Sagent Lending</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-text-faint">Status: active account with expansion opportunity</p>
            <p className="mt-2 text-[12px] text-text-secondary">Expansion focus: win one ops-owned workflow, then expand team coverage off the credibility of that result.</p>
          </article>
          <article
            className={`rounded-xl border bg-surface-muted/30 p-3 ${
              selectedAccountId === "ciena-corp"
                ? "border-accent/30"
                : "border-surface-border/50 opacity-85"
            }`}
          >
            <p className="text-[14px] font-semibold text-text-primary">Ciena Corp</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-text-faint">Status: existing deployment, scope to be mapped</p>
            <p className="mt-2 text-[12px] text-text-secondary">Expansion focus: platformize Snowflake across domains by reducing cross-team friction via shared data products and governance.</p>
          </article>
        </div>
      </section>

      <section id="execution-model" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <SectionHeader
          title="My Snowflake Operating Model"
          subtitle="Execution-focused approach for landing and expanding in enterprise accounts."
        />
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-text-faint">Step 1</p>
            <p className="mt-1 text-[14px] font-semibold text-text-primary">Pick the right expansion workload</p>
            <p className="mt-2 text-[12px] text-text-secondary">Start with one business workflow where ownership is clear and outcomes matter. Prioritize the expansion motion most likely to drive adoption and near-term consumption.</p>
          </article>
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-text-faint">Step 2</p>
            <p className="mt-1 text-[14px] font-semibold text-text-primary">Build internal alignment and external momentum</p>
            <p className="mt-2 text-[12px] text-text-secondary">Map the org, align the right technical and business stakeholders, and coordinate tightly across AE, SDR, SE, and partners to create a focused account motion.</p>
          </article>
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-text-faint">Step 3</p>
            <p className="mt-1 text-[14px] font-semibold text-text-primary">Expand through usage and adjacent workloads</p>
            <p className="mt-2 text-[12px] text-text-secondary">Use the initial win to grow consumption over time through adjacent teams, broader data adoption, and new platform use cases.</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <SectionHeader
          title="How Accounts Expand"
          subtitle="Clear land-and-expand sequence based on workload execution."
        />
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
          {["Initial Workload", "Early Adoption", "Broader Platform Trust", "Expanded Consumption"].map((step) => (
            <div key={step} className="rounded-lg border border-surface-border/50 bg-surface-muted/30 px-3 py-2 text-[12px] font-medium text-text-secondary">
              {step}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-text-secondary">
          The goal is not a one-time transaction. The goal is to land a meaningful workload, prove value quickly, and create a path for broader Snowflake adoption across the account.
        </p>
      </section>

      {/* SECTION 2: TERRITORY PRIORITIES */}
      <section id="territory-priorities" className="scroll-mt-24 space-y-4">
        <SectionHeader
          title="Territory Priorities"
          subtitle="Three priority accounts I would run immediately in this territory."
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {territoryPriorityAccounts.map((priority) => (
            <article
              key={priority.id}
              className={`rounded-2xl border p-4 transition-colors ${
                selectedAccountId === priority.id
                  ? "border-accent/35 bg-accent/[0.05]"
                  : priority.isPrimary
                    ? "border-accent/25 bg-accent/[0.03] opacity-90"
                    : "border-surface-border/50 bg-surface-elevated/30 opacity-90"
              } ${priority.isPrimary ? "xl:col-span-2" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">{priority.name}</h3>
                  <p className="mt-0.5 text-[12px] text-text-muted">{priority.industry}</p>
                </div>
                <div className="flex items-center gap-2">
                  {priority.isPrimary ? (
                    <span className="rounded-full border border-accent/35 bg-accent/[0.10] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-accent">
                      {priority.primaryLabel ?? "Primary Expansion Focus"}
                    </span>
                  ) : (
                    <span className="rounded-full border border-accent/30 bg-accent/[0.08] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-accent">
                      Tier 1
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-faint">
                    Immediate Focus
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-[12px] leading-relaxed">
                <p><span className="font-semibold text-text-primary">Status:</span> <span className="text-text-secondary">{priority.status}</span></p>
                <p><span className="font-semibold text-text-primary">Why This Account Matters:</span> <span className="text-text-secondary">{priority.why}</span></p>
                <p><span className="font-semibold text-text-primary">Expansion Focus:</span> <span className="text-text-secondary">{priority.likelyLand}</span></p>
                <p><span className="font-semibold text-text-primary">Broader Expansion Path:</span> <span className="text-text-secondary">{priority.expansionPath}</span></p>
                <p><span className="font-semibold text-text-primary">Competitive Context:</span> <span className="text-text-secondary">{priority.pressure}</span></p>
                <p><span className="font-semibold text-text-primary">Key Personas:</span> <span className="text-text-secondary">{priority.personas}</span></p>
                <p><span className="font-semibold text-text-primary">Account Context:</span> <span className="text-text-secondary">{priority.hypothesis}</span></p>
                <p><span className="font-semibold text-text-primary">POV:</span> <span className="text-text-secondary">{priority.pov}</span></p>
                <p><span className="font-semibold text-text-primary">What I&apos;d Validate First:</span> <span className="text-text-secondary">{priority.validateFirst}</span></p>
                <p><span className="font-semibold text-text-primary">Next Best Move:</span> <span className="text-text-secondary">{priority.nextMove}</span></p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectAccount(priority.id);
                    setActiveDossierTab("Business Overview");
                    document
                      .getElementById("account-dossiers")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded-lg border border-accent/30 bg-accent/[0.08] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/[0.14]"
                >
                  Open Account Dossier
                </button>
              </div>
              <p className="mt-2 text-[10px] text-text-faint">
                Last updated: {formatUpdatedAt(accountLastUpdated[priority.id])}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 3: DAILY ACCOUNT BRIEFING */}
      <section id="daily-account-briefing" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader
          title="Daily Account Briefing"
          subtitle="Example public-signal workflow for turning account changes into next actions."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {territoryPriorityAccounts.map((priority) => (
            <button
              key={priority.id}
              type="button"
              onClick={() => onSelectAccount(priority.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                selectedAccountId === priority.id
                  ? "border border-accent/30 bg-accent/[0.10] text-accent"
                  : "border border-surface-border/50 bg-surface-muted/40 text-text-muted hover:border-accent/20 hover:text-text-secondary"
              }`}
            >
              {priority.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["24h", "7d", "30d", "12m"] as const).map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setActiveBriefingWindow(window)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                activeBriefingWindow === window
                  ? "border border-accent/30 bg-accent/[0.10] text-accent"
                  : "border border-surface-border/50 bg-surface-muted/40 text-text-muted hover:border-accent/20 hover:text-text-secondary"
              }`}
            >
              {window}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-text-faint">Key signals</p>
            <p className="mt-1.5 text-[12px] text-text-secondary">{activeBriefing.keySignals}</p>
          </div>
          <div className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-text-faint">What changed</p>
            <p className="mt-1.5 text-[12px] text-text-secondary">{activeBriefing.whatChanged}</p>
          </div>
          <div className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-text-faint">Why it matters</p>
            <p className="mt-1.5 text-[12px] text-text-secondary">{activeBriefing.whyItMatters}</p>
          </div>
          <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-accent/90">Snowflake implication</p>
            <p className="mt-1.5 text-[12px] text-text-secondary">{activeBriefing.snowflakeImplication}</p>
          </div>
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-rose-300/90">Databricks implication</p>
            <p className="mt-1.5 text-[12px] text-text-secondary">{activeBriefing.databricksImplication}</p>
          </div>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-emerald-300/90">Next best move</p>
            <p className="mt-1.5 text-[12px] text-text-secondary">{activeBriefing.nextBestMove}</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: THIS WEEK'S OPERATING PRIORITIES */}
      <section id="operating-priorities" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader
          title="This Week's Operating Priorities"
          subtitle="Practical actions to advance account ownership this week."
        />
        <div className="mt-4 space-y-2.5">
          {weeklyOperatingPriorities.slice(0, 5).map((item) => (
            <article key={item.title} className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
              <div className="grid grid-cols-1 gap-1.5 text-[12px] sm:grid-cols-[1.2fr_1fr_1fr_1.2fr] sm:gap-3">
                <p className="text-text-primary"><span className="text-text-faint">Action:</span> {item.title}</p>
                <p className="text-text-secondary"><span className="text-text-faint">Why now:</span> {item.whyNow}</p>
                <p className="text-text-secondary"><span className="text-text-faint">Target:</span> {item.targetAccount}</p>
                <p className="text-text-secondary"><span className="text-text-faint">Expected outcome:</span> {item.expectedOutcome}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 5: ACCOUNT DOSSIER */}
      <section className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader
          title="Account Dossier"
          subtitle="Fact and inference are separated to keep account POVs practical and honest."
        />
      </section>
      <section
        id="account-dossiers"
        className={`scroll-mt-24 rounded-2xl border bg-surface-elevated/30 p-4 sm:p-6 transition-colors ${
          dossierFocus
            ? "border-accent/35"
            : "border-surface-border/50"
        }`}
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
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refreshDossierAnalysis}
            disabled={refreshingDossier}
            className="rounded-lg border border-surface-border/60 bg-surface-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary disabled:opacity-60"
          >
            {refreshingDossier ? "Refreshing..." : "Manual Refresh"}
          </button>
          <button
            type="button"
            onClick={buildAccountBrief}
            className="rounded-lg border border-accent/30 bg-accent/[0.08] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/[0.14]"
          >
            Generate Account Brief
          </button>
          <button
            type="button"
            onClick={copyNotebookPrompt}
            className="rounded-lg border border-surface-border/60 bg-surface-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary"
          >
            Copy NotebookLM Prompt
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="rounded-lg border border-surface-border/60 bg-surface-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary"
          >
            Export PDF
          </button>
          <p className="ml-auto text-[10px] text-text-faint">
            Last updated: {formatUpdatedAt(dossierLastUpdated)}
          </p>
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
            Fact/inference labels separate observed public context from strategy interpretation. Exact cloud spend, Snowflake consumption, and vendor relationships must be validated post-onboarding.
          </p>
        </div>
      </section>

      {/* SECTION 6: EXECUTION FRAMEWORK */}
      <section id="execution-framework" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader
          title="Execution Framework"
          subtitle="Support layer only: concise field guidance for execution."
        />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">Snowflake Positioning</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
              <li>Governed enterprise data + AI platform built for production scale.</li>
              <li>Land and expand through workload specificity, not broad transformation language.</li>
              <li>Differentiate on governance, interoperability, and enterprise readiness.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">How I Would Sell It</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
              <li>Anchor the first call on one business use case with executive impact.</li>
              <li>Show how Snowflake unifies access, governance, and execution speed.</li>
              <li>Define a land that can realistically expand across adjacent workloads.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">First 30 Days</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
              <li>Map the three priority accounts, active workloads, and executive-level triggers.</li>
              <li>Determine ownership of data, AI, and platform decisions.</li>
              <li>Validate competitor footprint, buying process, and partner influence.</li>
              <li>Publish first-call POVs and next actions for each Tier 1 account.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">Competitive Frame</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
              <li>Databricks can be entrenched in ML or engineering paths - test this early.</li>
              <li>Compete on enterprise trust, governance confidence, and workload breadth.</li>
              <li>Keep the comparison tied to business outcomes, not feature theater.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* SECTION 7: BRIEFING ENGINE */}
      <section id="briefing-engine" className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-accent/80" />
          <SectionHeader
            title="Weekly Territory Briefing Habit"
            subtitle="Field execution cadence for account reviews, pre-call prep, and weekly territory alignment."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={buildAccountBrief}
            className="rounded-lg border border-accent/30 bg-accent/[0.08] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/[0.14]"
          >
            Account Review Prep
          </button>
          <button
            type="button"
            onClick={buildTerritoryBrief}
            className="rounded-lg border border-accent/30 bg-accent/[0.08] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/[0.14]"
          >
            Weekly Territory Brief
          </button>
          <button
            type="button"
            onClick={copyNotebookPrompt}
            className="rounded-lg border border-surface-border/60 bg-surface-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary"
          >
            Copy Pre-Call Brief Prompt
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="rounded-lg border border-surface-border/60 bg-surface-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={refreshTerritoryBrief}
            disabled={refreshingTerritory}
            className="rounded-lg border border-surface-border/60 bg-surface-muted/40 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary transition-colors hover:border-accent/20 hover:text-text-primary disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-1.5">
              <RefreshCcw className="h-3.5 w-3.5" />
              {refreshingTerritory ? "Refreshing..." : "Manual Refresh"}
            </span>
          </button>
          <p className="ml-auto self-center text-[10px] text-text-faint">Last updated: {formatUpdatedAt(territoryLastUpdated)}</p>
        </div>
        <div className="mt-4 rounded-xl border border-surface-border/50 bg-surface-muted/30 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">
            {briefingOutputTitleOverride ?? `${activeBriefingAccount.name} · ${activeBriefingWindow} Account Brief`}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-surface-border/50 bg-surface-elevated/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-text-faint">What changed</p>
              <p className="mt-1 text-[12px] text-text-secondary">{briefingOutput?.whatChanged ?? activeBriefing.whatChanged}</p>
            </div>
            <div className="rounded-lg border border-surface-border/50 bg-surface-elevated/40 p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-text-faint">Why it matters</p>
              <p className="mt-1 text-[12px] text-text-secondary">{briefingOutput?.whyItMatters ?? activeBriefing.whyItMatters}</p>
            </div>
            <div className="rounded-lg border border-accent/25 bg-accent/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-accent/90">Snowflake implication</p>
              <p className="mt-1 text-[12px] text-text-secondary">{briefingOutput?.snowflakeImplication ?? activeBriefing.snowflakeImplication}</p>
            </div>
            <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.05] p-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-rose-300/90">Databricks implication</p>
              <p className="mt-1 text-[12px] text-text-secondary">{briefingOutput?.databricksImplication ?? activeBriefing.databricksImplication}</p>
            </div>
          </div>
          <div className="mt-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-emerald-300/90">Recommended action</p>
            <p className="mt-1 text-[12px] text-text-secondary">{briefingOutput?.recommendedAction ?? activeBriefing.nextBestMove}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
