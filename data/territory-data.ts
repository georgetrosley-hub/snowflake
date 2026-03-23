/**
 * Merged territory data: App B's operator-ready format + App A's strategic context (condensed 35%)
 */

export interface PriorityAccount {
  id: string;
  name: string;
  industry: string;
  priority: number;
  status: string;
  /** Why this account matters */
  whyMatters: string;
  /** Best expansion wedge */
  expansionWedge: string;
  /** What to confirm first */
  confirmFirst: string;
  /** POV hypothesis */
  povHypothesis: string;
  /** Recommended next action */
  nextAction: string;
  /** Proof point for first workload */
  proofPoint: string;
  /** Pivot if wedge doesn't land */
  pivotIfNeeded: string;
  lastTouch: string;
  /** Current motion - what we're executing now */
  currentMotion: string;
  /** Competitive context - 2 concise bullets */
  competitiveContext: string[];
  /** Expansion path after first workload lands */
  expansionPathSteps: string[];
}

export const priorityAccounts: PriorityAccount[] = [
  {
    id: "us-financial-technology",
    name: "U.S. Financial Technology",
    industry: "Financial Technology",
    priority: 1,
    status: "Existing Snowflake customer—mission-critical footprint to validate",
    whyMatters:
      "Highest-confidence expansion. Scale, regulatory scrutiny, and ops risk make governance non-negotiable.",
    expansionWedge: "Governed regulatory reporting or risk analytics—auditability and lineage required.",
    confirmFirst:
      "Current Snowflake footprint, which teams are active, where Databricks sits, active regulatory initiatives, who owns governance and budget.",
    povHypothesis: "Constraint is alignment, not capability. Expansion depends on connecting governance, ownership, and budget across siloed teams.",
    nextAction:
      "Identify one executive-visible regulatory workflow, confirm owner, align expansion to concrete business requirement.",
    proofPoint: "Surface real-time anomaly vs delayed reporting",
    pivotIfNeeded: "Stakeholder reporting latency",
    lastTouch: "2025-03-12",
    currentMotion: "SE alignment on anomaly workload; data platform leadership intro",
    competitiveContext: [
      "Databricks in analytics silos; governance gaps create Snowflake wedge.",
      "Regulatory pressure favors governed platform with lineage.",
    ],
    expansionPathSteps: ["Initial Workload", "Early Adoption", "Platform Trust", "Expanded Consumption"],
  },
  {
    id: "sagent-lending",
    name: "Sagent Lending",
    industry: "Lending Technology",
    priority: 2,
    status: "Active account with expansion opportunity",
    whyMatters:
      "Lending is ops-intense. Data quality and timeliness tie directly to customer outcomes and risk.",
    expansionWedge: "Lending ops workflow where cycle time and reconciliation pain are real.",
    confirmFirst:
      "Current Snowflake usage, which teams are active vs adjacent, Databricks footprint, active data/AI initiatives, budget ownership.",
    povHypothesis: "Risk isn't building Dara—it's proving it works across customers. Win one ops-owned workflow, then expand team coverage.",
    nextAction:
      "Ask Product/CS which of first 3–5 Dara deployments are at risk and why.",
    proofPoint: "Identify 1–2 underperforming Dara deployments",
    pivotIfNeeded: "Borrower-level intelligence",
    lastTouch: "2025-03-15",
    currentMotion: "Discovery prep—Dara deployment risk; CS follow-up on timelines",
    competitiveContext: [
      "Dara rollout creates urgency; ops teams need governed data layer.",
      "Board expects measurable outcomes—tie wedge to customer risk reduction.",
    ],
    expansionPathSteps: ["Initial Workload", "Early Adoption", "Platform Trust", "Expanded Consumption"],
  },
  {
    id: "ciena-corp",
    name: "Ciena Corp",
    industry: "Networking Technology",
    priority: 3,
    status: "Existing deployment—scope to be mapped",
    whyMatters:
      "Enterprise networking has dispersed data ownership across product, ops, and GTM. Fragmentation creates expansion opportunity.",
    expansionWedge: "Backlog risk + margin visibility on AI deals.",
    confirmFirst:
      "Snowflake usage and org coverage, Databricks footprint, active analytics/AI initiatives, decision ownership and buying process.",
    povHypothesis: "Risk is not demand—it's execution against that demand.",
    nextAction:
      "Request 2–3 AI deals from CFO org to map order > backlog > fulfillment > margin.",
    proofPoint: "Show backlog risk on 2–3 AI deals within 24 hours",
    pivotIfNeeded: "Supply chain constraint visibility",
    lastTouch: "2025-03-18",
    currentMotion: "CFO outreach—backlog risk; AI deal list from FP&A",
    competitiveContext: [
      "AI demand outstrips execution; forecast accuracy pressure from Street.",
      "Fragmented tools; Snowflake unifies order-to-fulfillment visibility.",
    ],
    expansionPathSteps: ["Initial Workload", "Early Adoption", "Platform Trust", "Expanded Consumption"],
  },
];

export interface WeekItem {
  day: string;
  account: string;
  action: string;
}

export const next7Days: WeekItem[] = [
  { day: "Mon 3/24", account: "ciena-corp", action: "Draft CFO outreach—backlog risk angle" },
  { day: "Tue 3/25", account: "ciena-corp", action: "Request AI deal list from FP&A contact" },
  { day: "Wed 3/26", account: "sagent-lending", action: "Discovery call prep—Dara deployment risk" },
  { day: "Thu 3/27", account: "sagent-lending", action: "Follow-up with CS on deployment timelines" },
  { day: "Fri 3/28", account: "us-financial-technology", action: "SE alignment—scope anomaly workload" },
  { day: "Mon 3/31", account: "us-financial-technology", action: "Data platform leadership intro meeting" },
];

export interface ActivityItem {
  timestamp: string;
  account: string;
  text: string;
}

export const defaultActivities: ActivityItem[] = [
  { timestamp: "2025-03-20", account: "ciena-corp", text: "Research: New CFO appointed, raised FY26 guidance" },
  { timestamp: "2025-03-19", account: "sagent-lending", text: "LinkedIn: CEO and President hired in past 12 months" },
  { timestamp: "2025-03-18", account: "ciena-corp", text: "POV drafted: Backlog risk on AI deals" },
  { timestamp: "2025-03-15", account: "sagent-lending", text: "Identified Dara first-wave rollout as compelling event" },
  { timestamp: "2025-03-12", account: "us-financial-technology", text: "Mapped securitization ops exception workflows" },
];

export interface SignalItem {
  timestamp: string;
  account: string;
  text: string;
}

export const defaultSignals: SignalItem[] = [
  { timestamp: "2025-03-21", account: "ciena-corp", text: "Ciena Q3 earnings: AI demand 30%+ YoY, backlog at record levels" },
  { timestamp: "2025-03-19", account: "sagent-lending", text: "Sagent: Dara entering first wave of at-scale customer rollouts" },
  { timestamp: "2025-03-18", account: "us-financial-technology", text: "US FinTech strategic pivot: internal utility to external platform" },
  { timestamp: "2025-03-15", account: "ciena-corp", text: "Street expects Ciena execution, not just demand—forecast accuracy pressure" },
  { timestamp: "2025-03-10", account: "sagent-lending", text: "Board wants measurable platform outcomes from new leadership" },
];
