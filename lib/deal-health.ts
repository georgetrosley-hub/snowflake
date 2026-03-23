import type { AccountUpdate, ExecutionItem, Stakeholder } from "@/types";

export type DealHealth = "healthy" | "attention" | "at_risk";

export interface DealHealthSummary {
  status: DealHealth;
  label: string;
  reason: string;
}

function isRecentUpdate(createdAt: string): boolean {
  const lower = createdAt.toLowerCase();
  return (
    lower.includes("today") ||
    lower.includes("just now") ||
    lower.includes("yesterday")
  );
}

export function isStale(lastUpdated: string): boolean {
  const lower = lastUpdated.toLowerCase();
  return (
    !lower.includes("just now") &&
    !lower.includes("today") &&
    !lower.includes("yesterday") &&
    !lower.includes("this morning") &&
    !lower.includes("updated just now") &&
    !lower.includes("deferred just now")
  );
}

export function isStaleUpdate(createdAt: string): boolean {
  const lower = createdAt.toLowerCase();
  return !lower.includes("today") && !lower.includes("just now") && !lower.includes("yesterday");
}

export function getDealHealth(
  executionItems: ExecutionItem[],
  accountUpdates: AccountUpdate[],
  stakeholders: Stakeholder[]
): DealHealthSummary {
  const blockedCount = executionItems.filter((i) => i.status === "blocked").length;
  const pendingDecisions = executionItems.filter(
    (i) => i.decisionRequired && i.decisionStatus === "pending"
  ).length;
  const championCount = stakeholders.filter(
    (s) => s.stance === "champion" || s.stance === "ally"
  ).length;
  const hasRecentUpdate = accountUpdates.some((u) => isRecentUpdate(u.createdAt));

  if (blockedCount >= 2 || pendingDecisions >= 2) {
    return {
      status: "at_risk",
      label: "At risk",
      reason: `${blockedCount} blocker${blockedCount === 1 ? "" : "s"}, ${pendingDecisions} decision${pendingDecisions === 1 ? "" : "s"} pending`,
    };
  }

  if (blockedCount >= 1 || !hasRecentUpdate || championCount < 2) {
    return {
      status: "attention",
      label: "Needs attention",
      reason:
        blockedCount >= 1
          ? "Blocker to resolve"
          : !hasRecentUpdate
            ? "No recent activity"
            : "Champion coverage light",
    };
  }

  return {
    status: "healthy",
    label: "On track",
    reason: "Champion aligned, recent activity",
  };
}
