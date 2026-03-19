"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenCheck, RefreshCcw } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { SectionId } from "@/components/layout/sidebar";
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
  onUpdateWorkspaceField: (field: keyof WorkspaceDraft, value: string) => void;
  onAddAccountUpdate: (
    title: string,
    note: string,
    tag: AccountUpdate["tag"]
  ) => void;
  activeSection?: SectionId;
}

export function Overview({
  activeSection,
}: OverviewProps) {
  const sectionAnchorByNav: Record<SectionId, string> = {
    territoryPriorities: "territory-priorities",
    dailyBriefing: "daily-account-briefing",
    accountDossiers: "account-dossiers",
    operatingPriorities: "operating-priorities",
    executionFramework: "execution-framework",
    briefingEngine: "briefing-engine",
  };
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
      likelyLand: "Analytics and governed reporting for a high-visibility operating workflow.",
      expansionPath: "Expand into AI-assisted analytics, operational decisioning, and data-sharing products.",
      pressure: "Likely Databricks technical momentum plus cloud-native alternatives.",
      personas: "CDO, Head of Data Engineering, Analytics leader, Governance lead.",
      hypothesis: "Public signal: modernization pressure is rising. Initial hypothesis: sponsor will back a narrow pilot if governance and speed are both addressed.",
      nextMove: "Run executive alignment call and lock 90-day pilot success metrics.",
    },
    {
      id: "t1-02",
      name: "Tier 1 Account 02",
      industry: "Industry Placeholder",
      why: "Clear modernization mandate and fragmented analytics stack creating urgent operational friction.",
      likelyLand: "Data engineering + analytics standardization in one mission-critical workflow.",
      expansionPath: "Broaden to enterprise-wide data products, AI workloads, and departmental self-service.",
      pressure: "Databricks evaluation likely active with cloud-native alternatives in scope.",
      personas: "CIO, Data Engineering Director, Finance Analytics leader, Security architect.",
      hypothesis: "Public signal: consolidation language appears in leadership messaging. To validate post-onboarding: incumbent architecture constraints.",
      nextMove: "Secure technical workshop with decision-makers and map incumbent displacement path.",
    },
    {
      id: "t1-03",
      name: "Tier 1 Account 03",
      industry: "Industry Placeholder",
      why: "High-value data assets and strong executive appetite for governed AI deployment at scale.",
      likelyLand: "AI/ML-ready governed data foundation for one priority domain team.",
      expansionPath: "Scale to additional domains, partner data exchange, and enterprise AI applications.",
      pressure: "Databricks incumbency likely strong; cloud-native alternatives may shape economics.",
      personas: "Chief Digital Officer, Head of Data Science, Platform owner, Risk/Compliance.",
      hypothesis: "Initial hypothesis: risk-controlled speed is the winning narrative. To validate post-onboarding: actual buyer map and approval gates.",
      nextMove: "Identify champion and co-author pilot narrative for steering committee review.",
    },
    {
      id: "t1-04",
      name: "Tier 1 Account 04",
      industry: "Industry Placeholder",
      why: "Large downstream business impact tied to analytics latency and inconsistent governance standards.",
      likelyLand: "Governance + analytics consistency for a priority business unit.",
      expansionPath: "Expand into predictive analytics, AI-powered operations, and cross-region data collaboration.",
      pressure: "Databricks technical champions likely active; cloud-native alternatives are default shortlist options.",
      personas: "BU President, Head of Data, Enterprise Architect, Security leader.",
      hypothesis: "Public signal: BU urgency is visible. Initial hypothesis: a scoped business-case pilot can bypass platform politics.",
      nextMove: "Present value case with timeline, owners, and go-live criteria in next exec readout.",
    },
    {
      id: "t1-05",
      name: "Tier 1 Account 05",
      industry: "Industry Placeholder",
      why: "Active transformation program with budget available but no clear governed platform standard yet.",
      likelyLand: "Secure shared analytics + data sharing across key operating teams.",
      expansionPath: "Move into AI productization, external data distribution, and enterprise workload standardization.",
      pressure: "Databricks preference may exist in engineering; cloud-native alternatives likely in parallel.",
      personas: "CTO, VP Engineering, Data Governance leader, LoB analytics sponsor.",
      hypothesis: "Initial hypothesis: support increases once governance is shown without slowing delivery. To validate post-onboarding: current vendor footprint.",
      nextMove: "Launch multi-threaded stakeholder plan and convert current interest into pilot commitment.",
    },
  ] as const;
  type PriorityAccount = (typeof territoryPriorityAccounts)[number];

  const [activeDossierId, setActiveDossierId] = useState<PriorityAccount["id"]>(
    territoryPriorityAccounts[0].id
  );
  const [activeDossierTab, setActiveDossierTab] = useState<DossierTab>("Business Overview");
  const [activeBriefingAccountId, setActiveBriefingAccountId] = useState<PriorityAccount["id"]>(
    territoryPriorityAccounts[0].id
  );
  const [activeBriefingWindow, setActiveBriefingWindow] = useState<"24h" | "7d" | "30d" | "12m">("24h");
  const [briefingOutputTitle, setBriefingOutputTitle] = useState("Territory Brief");
  const [briefingOutput, setBriefingOutput] = useState<{
    whatChanged: string;
    whyItMatters: string;
    snowflakeImplication: string;
    databricksImplication: string;
    recommendedAction: string;
  } | null>(null);
  const [accountLastUpdated, setAccountLastUpdated] = useState<Record<PriorityAccount["id"], string>>({
    "t1-01": "",
    "t1-02": "",
    "t1-03": "",
    "t1-04": "",
    "t1-05": "",
  });
  const [dossierLastUpdated, setDossierLastUpdated] = useState<string>("");
  const [territoryLastUpdated, setTerritoryLastUpdated] = useState<string>("");
  const [refreshingAccountId, setRefreshingAccountId] = useState<PriorityAccount["id"] | null>(null);
  const [refreshingDossier, setRefreshingDossier] = useState(false);
  const [refreshingTerritory, setRefreshingTerritory] = useState(false);
  const activeDossierAccount =
    territoryPriorityAccounts.find((priority) => priority.id === activeDossierId) ??
    territoryPriorityAccounts[0];
  const activeBriefingAccount =
    territoryPriorityAccounts.find((priority) => priority.id === activeBriefingAccountId) ??
    territoryPriorityAccounts[0];
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
  > = {
    "t1-01": {
      "24h": {
        keySignals: "Leadership team aligning on near-term operating priorities; data reliability surfaced in internal planning rhythm.",
        whatChanged: "Decision owners narrowed to business + platform + security trio.",
        whyItMatters: "Buying motion is becoming more actionable and sponsor-driven.",
        snowflakeImplication: "Lead with governed execution path for one high-visibility workflow.",
        databricksImplication: "Databricks remains default technical option if evaluation scope stays tool-centric.",
        nextBestMove: "Set exec-level discovery call and lock pilot success criteria before architecture deep dive.",
      },
      "7d": {
        keySignals: "Cross-functional alignment improving; urgency around delivery speed increasing.",
        whatChanged: "Stakeholders moved from exploration to shortlist framing.",
        whyItMatters: "Commercial narrative can now influence evaluation criteria.",
        snowflakeImplication: "Anchor on governance + time-to-value in a single workflow.",
        databricksImplication: "Incumbent engineering preference may define requirements if unchallenged.",
        nextBestMove: "Drive workflow-specific scorecard that emphasizes measurable business outcomes.",
      },
      "30d": {
        keySignals: "Transformation cadence established with recurring decision checkpoints.",
        whatChanged: "Risk and control stakeholders now actively shaping path-to-production.",
        whyItMatters: "Deals will favor platforms that satisfy governance without slowing delivery.",
        snowflakeImplication: "Differentiate on enterprise control and cross-team adoption.",
        databricksImplication: "Competitive pressure rises where technical proof is separated from business proof.",
        nextBestMove: "Run joint workshop with business + security + platform to scope first land motion.",
      },
      "12m": {
        keySignals: "Enterprise roadmap points to broader platform standardization and AI operating model maturity.",
        whatChanged: "Decision lens shifted from point capability to durable platform outcomes.",
        whyItMatters: "Long-cycle expansion potential is significant if first workload lands cleanly.",
        snowflakeImplication: "Win first wedge, then expand through adjacent governed AI and data-sharing workloads.",
        databricksImplication: "Long-term incumbent inertia persists without early multi-threaded sponsorship.",
        nextBestMove: "Map year-long expansion sequence before pilot launch to avoid one-off outcome.",
      },
    },
    "t1-02": {
      "24h": {
        keySignals: "Program leads prioritizing simplification and faster reporting cycles.",
        whatChanged: "Current-state friction now framed as business risk, not technical debt alone.",
        whyItMatters: "Economic buyer relevance increased in the near term.",
        snowflakeImplication: "Position Snowflake as low-friction consolidation path with governance confidence.",
        databricksImplication: "Databricks gains if discussion remains centered on engineering preference.",
        nextBestMove: "Secure business-owner interview and quantify one workflow delay impact.",
      },
      "7d": {
        keySignals: "Modernization roadmap discussions now include platform rationalization criteria.",
        whatChanged: "Evaluation shifted from tools to operating model fit.",
        whyItMatters: "Commercial differentiation has more influence than feature parity.",
        snowflakeImplication: "Lead with measurable operating improvement and controlled rollout.",
        databricksImplication: "Competitive narrative likely pushes flexibility and existing familiarity.",
        nextBestMove: "Publish a one-page pilot charter with owners, timeline, and governance gates.",
      },
      "30d": {
        keySignals: "Stakeholder map expanded to finance and procurement oversight.",
        whatChanged: "Buying process formalized with clearer risk/return scrutiny.",
        whyItMatters: "Decision quality will favor business-case clarity over technical novelty.",
        snowflakeImplication: "Use outcome-linked business case as primary selling asset.",
        databricksImplication: "Cloud and incumbent momentum can sway procurement without business proof.",
        nextBestMove: "Lead executive session on KPI-linked pilot outcomes and approval path.",
      },
      "12m": {
        keySignals: "Account trajectory indicates phased consolidation with broad AI-readiness ambition.",
        whatChanged: "Strategic intent moved from tactical fixes to platform-level governance standards.",
        whyItMatters: "Expansion path is material if first deployment creates repeatable trust.",
        snowflakeImplication: "Design first land to be replicable across adjacent departments.",
        databricksImplication: "Entrenched defaults will harden if no early executive win is secured.",
        nextBestMove: "Pre-wire expansion playbook with two follow-on workloads before first signature.",
      },
    },
    "t1-03": {
      "24h": {
        keySignals: "AI discussions are active with explicit risk and governance language.",
        whatChanged: "Pilot appetite increased, but only with clear controls.",
        whyItMatters: "Timing is favorable for a governed-first land message.",
        snowflakeImplication: "Position first motion as AI-ready data execution with enterprise safeguards.",
        databricksImplication: "Technical teams may default to existing patterns absent a business-led wedge.",
        nextBestMove: "Align champion on one AI-adjacent workflow with measurable success metrics.",
      },
      "7d": {
        keySignals: "Stakeholders converging around practical use-case sequencing.",
        whatChanged: "From broad AI ambition to specific deployment requirements.",
        whyItMatters: "Decision process is now concrete enough for commercial planning.",
        snowflakeImplication: "Frame Snowflake as governed execution layer for business-ready AI.",
        databricksImplication: "Databricks retains influence where evaluation is purely model/engineering oriented.",
        nextBestMove: "Run discovery on deployment blockers and governance acceptance criteria.",
      },
      "30d": {
        keySignals: "Cross-functional teams coordinating around risk and rollout cadence.",
        whatChanged: "Security and compliance moved from late-stage check to core decision makers.",
        whyItMatters: "Platform choice will be determined by production readiness, not prototypes.",
        snowflakeImplication: "Emphasize controlled deployment velocity and enterprise governance.",
        databricksImplication: "Competitive threat increases if proof-of-concept success is mistaken for production readiness.",
        nextBestMove: "Co-author production pilot plan with security stakeholder sponsorship.",
      },
      "12m": {
        keySignals: "Long-term posture points to scaled AI adoption tied to governed data foundations.",
        whatChanged: "Roadmap orientation shifted toward reusable operating patterns.",
        whyItMatters: "Landing the first governed workflow can unlock broad platform expansion.",
        snowflakeImplication: "Build expansion around repeatable domain rollouts and shared governance model.",
        databricksImplication: "Persistent technical incumbency can block enterprise standardization without executive proof.",
        nextBestMove: "Define multi-domain expansion blueprint aligned to annual planning cycle.",
      },
    },
    "t1-04": {
      "24h": {
        keySignals: "BU leaders highlighting operational performance pressure tied to analytics consistency.",
        whatChanged: "Business unit urgency overtook enterprise architecture debate.",
        whyItMatters: "Opportunity to land through accountable BU execution.",
        snowflakeImplication: "Target one high-impact BU workflow and prove governed delivery speed.",
        databricksImplication: "Databricks may keep technical advantage if BU pain is not converted into buyer urgency.",
        nextBestMove: "Secure BU sponsor and formalize pilot with enterprise governance observers.",
      },
      "7d": {
        keySignals: "Decision governance expanding across business, platform, and risk functions.",
        whatChanged: "Pilot criteria now include rollout confidence and supportability.",
        whyItMatters: "Commercial strategy must address both local value and enterprise control.",
        snowflakeImplication: "Show how one BU win can scale without creating governance debt.",
        databricksImplication: "Cloud-default pathways can appear safer if expansion story is vague.",
        nextBestMove: "Present phased land-to-expand path anchored in BU KPI movement.",
      },
      "30d": {
        keySignals: "Evaluation cadence stabilized with formal checkpoints.",
        whatChanged: "Procurement and risk teams are exerting stronger influence.",
        whyItMatters: "Deal success depends on operational credibility and risk clarity.",
        snowflakeImplication: "Lead with predictable deployment and governance-ready operating model.",
        databricksImplication: "Competitive risk rises if scoring model ignores business workflow outcomes.",
        nextBestMove: "Shape evaluation rubric around governance + business impact for target workflow.",
      },
      "12m": {
        keySignals: "Roadmap indicates cross-BU standardization opportunity after first measurable success.",
        whatChanged: "Strategic horizon moved from tactical fixes to platform-level consistency.",
        whyItMatters: "Large expansion possible if first BU motion becomes enterprise template.",
        snowflakeImplication: "Design first deployment as blueprint for adjacent BU rollouts.",
        databricksImplication: "Entrenched technical paths persist without early executive endorsement.",
        nextBestMove: "Establish executive review cadence linking pilot outcomes to expansion decisions.",
      },
    },
    "t1-05": {
      "24h": {
        keySignals: "Transformation stakeholders pushing for practical progress in near-term planning cycle.",
        whatChanged: "Discussion shifted from vision to executable first motion.",
        whyItMatters: "Window is open to define the evaluation narrative.",
        snowflakeImplication: "Lead with governed analytics layer that supports immediate operating decisions.",
        databricksImplication: "Databricks influence remains high where engineering defaults are unchallenged.",
        nextBestMove: "Run account planning call to align business outcomes and pilot scope.",
      },
      "7d": {
        keySignals: "Cross-functional teams converging on risk-managed rollout expectations.",
        whatChanged: "Governance and execution quality became explicit decision criteria.",
        whyItMatters: "Outcome-led positioning can outweigh pure technical preference.",
        snowflakeImplication: "Position Snowflake as enterprise-safe acceleration path.",
        databricksImplication: "Competitive threat is strongest if selection remains team-by-team.",
        nextBestMove: "Create unified decision brief for business, security, and platform stakeholders.",
      },
      "30d": {
        keySignals: "Procurement and architecture engagement indicates formal buy-cycle progression.",
        whatChanged: "Evaluation moving from interest to structured comparison.",
        whyItMatters: "Need clear commercial and governance differentiation now.",
        snowflakeImplication: "Use workflow-based proof and governance narrative to guide scoring.",
        databricksImplication: "Cloud co-sell and incumbent familiarity can dominate absent clear business case.",
        nextBestMove: "Deliver comparative POV focused on business risk, speed, and control.",
      },
      "12m": {
        keySignals: "Longer-term trajectory suggests potential platform standardization across multiple workloads.",
        whatChanged: "Planning horizon expanded from pilot to operating model durability.",
        whyItMatters: "Early land design will determine expansion ceiling.",
        snowflakeImplication: "Architect first deal for repeatable expansion into AI and shared data motions.",
        databricksImplication: "Default incumbency hardens over time without early executive-level win.",
        nextBestMove: "Map 12-month expansion sequencing and executive sponsors before launch.",
      },
    },
  };
  const activeBriefing = briefingByAccount[activeBriefingAccount.id][activeBriefingWindow];
  const buildAccountBrief = useCallback(() => {
    setBriefingOutputTitle(`${activeBriefingAccount.name} · ${activeBriefingWindow} Account Brief`);
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
    setBriefingOutputTitle(`Full Territory Brief · ${activeBriefingWindow}`);
    setBriefingOutput({
      whatChanged: `Priority-account motion across ${allAccounts} shifted toward clearer sponsor ownership and tighter evaluation criteria in the ${activeBriefingWindow} window.`,
      whyItMatters: "The territory is moving from discovery to decision framing; this is where evaluation rules and win rates are set.",
      snowflakeImplication:
        "Lead with governed execution in high-urgency workflows and keep expansion narrative explicit from the first pilot.",
      databricksImplication:
        "Databricks retains default technical momentum where business workflow outcomes are not explicitly tied to the evaluation.",
      recommendedAction:
        "Run one weekly executive cadence across Tier 1 accounts: confirm sponsor, lock pilot criteria, and pre-wire next expansion workload.",
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
  const weeklyOperatingPriorities = [
    {
      title: "Secure Tier 1 pilot scope and sponsor alignment",
      whyNow: "Decision criteria are still being shaped this week.",
      targetAccount: "Tier 1 Account 01",
      expectedOutcome: "Approved 90-day pilot charter with success metrics.",
    },
    {
      title: "Run consolidation discovery on highest-friction workflow",
      whyNow: "Business pain is now explicit and sponsor-visible.",
      targetAccount: "Tier 1 Account 02",
      expectedOutcome: "Validated land use case with quantified urgency.",
    },
    {
      title: "Lock governance path for AI-adjacent first deployment",
      whyNow: "Security stakeholders are active early in this cycle.",
      targetAccount: "Tier 1 Account 03",
      expectedOutcome: "Agreed deployment guardrails and approval path.",
    },
    {
      title: "Convert BU urgency into enterprise-backed pilot motion",
      whyNow: "BU performance pressure is creating fast executive air cover.",
      targetAccount: "Tier 1 Account 04",
      expectedOutcome: "Named BU sponsor and cross-functional deal team.",
    },
    {
      title: "Publish competitive POV before formal vendor scoring",
      whyNow: "Procurement process is moving from interest to comparison.",
      targetAccount: "Tier 1 Account 05",
      expectedOutcome: "Evaluation rubric aligned to governance and business outcomes.",
    },
  ] as const;
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
      if (parsed.briefingOutputTitle) setBriefingOutputTitle(parsed.briefingOutputTitle);
      if (parsed.briefingOutput) setBriefingOutput(parsed.briefingOutput);
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
          briefingOutputTitle,
          briefingOutput,
        })
      );
    } catch {
      // Ignore persistence errors.
    }
  }, [accountLastUpdated, dossierLastUpdated, territoryLastUpdated, briefingOutputTitle, briefingOutput]);

  const refreshAccount = useCallback(
    async (accountId: PriorityAccount["id"]) => {
      setRefreshingAccountId(accountId);
      await new Promise((resolve) => setTimeout(resolve, 850));
      const nowIso = new Date().toISOString();
      setAccountLastUpdated((prev) => ({ ...prev, [accountId]: nowIso }));
      setRefreshingAccountId(null);
      showToast("Account intelligence refreshed");
    },
    []
  );

  const generateAccountPov = useCallback(
    (accountId: PriorityAccount["id"]) => {
      setActiveDossierId(accountId);
      setActiveDossierTab("Snowflake POV");
      setBriefingOutputTitle(
        `${territoryPriorityAccounts.find((p) => p.id === accountId)?.name ?? "Tier 1 Account"} · Account POV`
      );
      const p = territoryPriorityAccounts.find((priority) => priority.id === accountId) ?? territoryPriorityAccounts[0];
      setBriefingOutput({
        whatChanged: `Stakeholder motion around ${p.name} is becoming more decision-oriented and workflow-specific.`,
        whyItMatters: "The best time to shape evaluation criteria is before requirements harden around incumbent defaults.",
        snowflakeImplication: `Lead with ${p.likelyLand.toLowerCase()} and tie it to executive-level business outcomes.`,
        databricksImplication: "Databricks remains strong when evaluations stay tool-first instead of outcome-first.",
        recommendedAction: p.nextMove,
      });
    },
    [territoryPriorityAccounts]
  );

  const refreshDossierAnalysis = useCallback(async () => {
    setRefreshingDossier(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const nowIso = new Date().toISOString();
    setDossierLastUpdated(nowIso);
    setRefreshingDossier(false);
  }, []);

  useEffect(() => {
    if (!activeSection) return;
    const anchor = sectionAnchorByNav[activeSection];
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeSection]);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* SECTION 1: HERO */}
      <div className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <h1 className="text-[20px] font-semibold tracking-tight text-text-primary sm:text-[24px]">
          How I Would Operate and Expand This Snowflake Territory
        </h1>
        <p className="mt-2 text-[13px] text-text-muted">
          A practical system for prioritizing accounts, building account POVs, tracking market and competitive shifts, and turning insight into action.
        </p>
        <p className="mt-4 text-[12px] text-text-secondary">
          This is not a study guide or a fake dashboard. It is how I would get dangerous in the territory as quickly as possible using public signals, structured hypotheses, and disciplined account prioritization.
        </p>
        <p className="mt-3 rounded-lg border border-surface-border/50 bg-surface-muted/30 px-3 py-2 text-[11px] text-text-muted">
          Built using public information only. Internal account details, consumption levels, active opportunities, and competitive footprint still need to be validated post-onboarding.
        </p>
      </div>

      {/* SECTION 2: TERRITORY PRIORITIES */}
      <section id="territory-priorities" className="space-y-4">
        <SectionHeader
          title="Territory Priorities"
          subtitle="Top five priority accounts I would run immediately in this territory."
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

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDossierId(priority.id);
                    setActiveDossierTab("Business Overview");
                    document
                      .getElementById("account-dossier-view")
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

      {/* SECTION 3: THIS WEEK'S OPERATING PRIORITIES */}
      <section id="operating-priorities" className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
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

      {/* SECTION 4: DAILY ACCOUNT BRIEFING */}
      <section id="daily-account-briefing" className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader
          title="Daily Account Briefing"
          subtitle="Example public-signal workflow for turning account changes into next actions."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {territoryPriorityAccounts.map((priority) => (
            <button
              key={priority.id}
              type="button"
              onClick={() => setActiveBriefingAccountId(priority.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                activeBriefingAccountId === priority.id
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

      {/* SECTION 5: ACCOUNT DOSSIER */}
      <section
        id="account-dossier-view"
        className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6"
      >
        <SectionHeader
          title="Account Dossier"
          subtitle="Fact and inference are separated to keep account POVs practical and honest."
        />
      </section>
      <section
        id="account-dossiers"
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
      <section id="execution-framework" className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <SectionHeader
          title="Execution Framework"
          subtitle="Compact field cheat sheet for positioning and first-month execution."
        />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">Snowflake Positioning</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
              <li>Governed enterprise data + AI platform for production workloads.</li>
              <li>Land and expand through workload specificity, not broad platform promises.</li>
              <li>Control plane, governance, and enterprise readiness are core differentiators.</li>
              <li>Win by proving speed and control in the same first motion.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">Core Use Case Entry Points</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
              <li>Analytics</li>
              <li>Data engineering</li>
              <li>AI/ML</li>
              <li>Apps</li>
              <li>Governance and sharing</li>
            </ul>
          </article>
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">First 30 Days</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
              <li>Map top accounts and likely workload priorities.</li>
              <li>Identify active workloads and buying triggers.</li>
              <li>Validate stakeholder ownership and approval sequence.</li>
              <li>Validate competitive footprint and likely Databricks exposure.</li>
              <li>Build first-call POVs for each Tier 1 account.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-surface-border/50 bg-surface-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">Competitive Frame</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-text-secondary">
              <li>Snowflake: enterprise trust, governance, interoperability, workload breadth.</li>
              <li>Databricks: strong technical momentum in engineering-led motions.</li>
              <li>Cloud-native alternatives: often default shortlist options on procurement cycles.</li>
              <li>Position on outcome speed + governance confidence, not tool theater.</li>
            </ul>
          </article>
        </div>
      </section>

      {/* SECTION 7: BRIEFING ENGINE */}
      <section id="briefing-engine" className="rounded-2xl border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-accent/80" />
          <SectionHeader
            title="Territory Briefing Engine"
            subtitle="Manual, stable-by-default briefing workflow for meetings, pipeline reviews, and onboarding."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={buildAccountBrief}
            className="rounded-lg border border-accent/30 bg-accent/[0.08] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/[0.14]"
          >
            Generate Account Brief
          </button>
          <button
            type="button"
            onClick={buildTerritoryBrief}
            className="rounded-lg border border-accent/30 bg-accent/[0.08] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/[0.14]"
          >
            Generate Full Territory Brief
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
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint">{briefingOutputTitle}</p>
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
