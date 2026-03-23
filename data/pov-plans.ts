import type { PriorityAccount } from "@/data/territory-data";

/** First-class POV plan: hypothesis → focused motion → expansion */
export interface PovPlan {
  accountId: string;
  objective: string;
  businessProblem: string;
  snowflakeWorkload: string;
  stakeholders: { kind: "business" | "technical"; title: string }[];
  dataRequired: string[];
  /** Two-week plan with milestone steps */
  timeline: { period: string; milestone: string }[];
  successCriteria: [string, string, string];
  followOnExpansion: string;
}

export const povPlansByAccount: Record<string, PovPlan> = {
  "us-financial-technology": {
    accountId: "us-financial-technology",
    objective:
      "Prove that governed Snowflake analytics can surface regulatory anomalies faster than the customer’s current reporting cycle with audit-ready lineage.",
    businessProblem:
      "Reporting latency and fragmented lineage slow regulatory response; leadership cannot tie spend to defensible outcomes.",
    snowflakeWorkload:
      "Horizon-governed regulatory reporting pipeline: curated marts, row access policies, and lineage from source to published KPIs.",
    stakeholders: [
      { kind: "business", title: "Chief Risk / Compliance sponsor" },
      { kind: "business", title: "LOB owner for reporting SLAs" },
      { kind: "technical", title: "Data platform lead" },
      { kind: "technical", title: "Security / IAM (RAP, network)" },
    ],
    dataRequired: [
      "One regulated reporting subject area (2–3 source systems)",
      "Sample historical runs + exception queue",
      "Current lineage / catalog posture (or gap)",
    ],
    timeline: [
      { period: "Week 1 · Days 1–3", milestone: "Scope workload, secure access, land curated mart + RAPs" },
      { period: "Week 1 · Days 4–5", milestone: "Baseline latency vs Snowflake path; lineage demo in Horizon" },
      { period: "Week 2 · Days 1–3", milestone: "Side-by-side anomaly detection on production-like slice" },
      { period: "Week 2 · Days 4–5", milestone: "Executive readout: proof, ROI bridge, expansion motion" },
    ],
    successCriteria: [
      "Anomaly surfaced ≥1 business day faster than baseline on agreed sample",
      "End-to-end lineage demonstrable for the scoped workflow in Horizon",
      "Named executive agrees to expansion scope (team + next workload)",
    ],
    followOnExpansion:
      "Adjacent regulatory workloads on the same platform contract; Cortex / Intelligence for exec Q&A once governance is trusted.",
  },
  "sagent-lending": {
    accountId: "sagent-lending",
    objective:
      "Prove Snowflake can operationalize lending data for at-risk Dara deployments with measurable cycle-time improvement on one ops workflow.",
    businessProblem:
      "Dara scale-out strains ops; reconciliation and deployment health are opaque across customers.",
    snowflakeWorkload:
      "Snowflake-centric ops mart + task-driven pipelines for deployment health and reconciliation exceptions tied to product telemetry.",
    stakeholders: [
      { kind: "business", title: "Product owner (Dara)" },
      { kind: "business", title: "Customer success lead" },
      { kind: "technical", title: "Data engineering lead" },
      { kind: "technical", title: "SRE / platform ops" },
    ],
    dataRequired: [
      "Telemetry + billing signals for 3–5 pilot customers",
      "Exception / ticket exports (anonymized)",
      "Current warehouse footprint and spend guardrails",
    ],
    timeline: [
      { period: "Week 1 · Days 1–3", milestone: "Pick 1–2 at-risk deployments; define success metrics with CS" },
      { period: "Week 1 · Days 4–5", milestone: "Ingest slice to Snowflake; first exception dashboard" },
      { period: "Week 2 · Days 1–3", milestone: "Side-by-side cycle time vs current process" },
      { period: "Week 2 · Days 4–5", milestone: "Readout with expansion path to adjacent teams" },
    ],
    successCriteria: [
      "≥20% reduction in cycle time on scoped exception path (agreed definition)",
      "CS + Product sign-off on dashboard as system of record for pilot cohort",
      "Expansion backlog: 2+ workloads queued with owner + date",
    ],
    followOnExpansion:
      "Roll out to remaining Dara cohorts; add AI features on governed data once ops trust is established.",
  },
  "ciena-corp": {
    accountId: "ciena-corp",
    objective:
      "Demonstrate unified visibility from order → backlog → fulfillment → margin for 2–3 AI deals so CFO can act before forecast miss.",
    businessProblem:
      "Strong AI demand with execution risk; margin visibility lags order intake and backlog.",
    snowflakeWorkload:
      "Cross-domain Snowflake model: sales, supply, and finance marts with secure sharing to FP&A and ops leadership.",
    stakeholders: [
      { kind: "business", title: "CFO / FP&A sponsor" },
      { kind: "business", title: "COO or supply chain lead" },
      { kind: "technical", title: "IT / data platform owner" },
      { kind: "technical", title: "Revenue / sales ops analytics" },
    ],
    dataRequired: [
      "2–3 AI deals with order, backlog, and shipment keys",
      "Margin rules the CFO will trust (even if partial)",
      "Current reporting latency (batch vs near-real-time)",
    ],
    timeline: [
      { period: "Week 1 · Days 1–3", milestone: "Align on 2–3 deals; map minimal viable data contract" },
      { period: "Week 1 · Days 4–5", milestone: "Land marts + first backlog risk view in Snowflake" },
      { period: "Week 2 · Days 1–3", milestone: "End-to-end margin bridge on scoped deals" },
      { period: "Week 2 · Days 4–5", milestone: "Executive readout + expansion to portfolio coverage" },
    ],
    successCriteria: [
      "Backlog risk visible for scoped deals within agreed SLA window",
      "CFO-aligned metrics: no manual spreadsheet for the readout",
      "Named expansion: next tranche of deals or org units on roadmap",
    ],
    followOnExpansion:
      "Portfolio-wide AI supply chain; Snowflake Intelligence for exec Q&A on governed data.",
  },
};

export function getPovPlan(accountId: string): PovPlan | null {
  return povPlansByAccount[accountId] ?? null;
}

export function buildPovPlanFromPriorityAccount(pa: PriorityAccount): PovPlan {
  const existing = getPovPlan(pa.id);
  if (existing) return existing;
  return {
    accountId: pa.id,
    objective: `Prove Snowflake value for ${pa.name} on the prioritized wedge: ${pa.expansionWedge.slice(0, 120)}…`,
    businessProblem: pa.whyMatters,
    snowflakeWorkload: pa.expansionWedge,
    stakeholders: [
      { kind: "business", title: "Executive sponsor" },
      { kind: "business", title: "LOB owner" },
      { kind: "technical", title: "Data platform lead" },
      { kind: "technical", title: "Security / IAM" },
    ],
    dataRequired: [
      "Source systems for the scoped workload",
      "Access and sample data for POV",
      "Success metrics agreed with business",
    ],
    timeline: [
      { period: "Week 1 · Days 1–3", milestone: "Scope, access, land baseline in Snowflake" },
      { period: "Week 1 · Days 4–5", milestone: "Build + first validation" },
      { period: "Week 2 · Days 1–3", milestone: "UAT + metrics capture" },
      { period: "Week 2 · Days 4–5", milestone: "Executive readout + expansion ask" },
    ],
    successCriteria: [
      "Metric hit on agreed business outcome",
      "Technical validation with SE sign-off",
      "Named next step for expansion",
    ],
    followOnExpansion: pa.pivotIfNeeded ? `Pivot path: ${pa.pivotIfNeeded}` : "Adjacent workloads and consumption expansion on platform.",
  };
}
