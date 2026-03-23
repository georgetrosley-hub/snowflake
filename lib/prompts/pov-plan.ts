import type { PriorityAccount } from "@/data/territory-data";
import type { PovPlan } from "@/data/pov-plans";

/**
 * Prompt for Strategy panel: refined POV plan output aligned to account progression.
 */
export function buildPovPlanGenerationPrompt(priorityAccount: PriorityAccount, plan: PovPlan): string {
  return `You are a Snowflake Enterprise AE working with a Solutions Engineer. Produce a polished, concise POV plan for ${priorityAccount.name}.

Use this internal plan as ground truth—refine wording, tighten bullets, and align to a 2-week execution window. Do not invent unrelated products.

**Account context**
- Industry: ${priorityAccount.industry}
- POV hypothesis: ${priorityAccount.povHypothesis}
- Recommended next action: ${priorityAccount.nextAction}

**Structured plan (source)**
- Objective: ${plan.objective}
- Business problem: ${plan.businessProblem}
- Snowflake workload: ${plan.snowflakeWorkload}
- Stakeholders: ${plan.stakeholders.map((s) => `${s.kind}=${s.title}`).join("; ")}
- Data required: ${plan.dataRequired.join(" | ")}
- Timeline: ${plan.timeline.map((t) => `${t.period}: ${t.milestone}`).join(" | ")}
- Success criteria: ${plan.successCriteria.join(" | ")}
- Follow-on expansion: ${plan.followOnExpansion}

**Output format (Markdown):**
## POV Plan — ${priorityAccount.name}

### Objective
One sentence.

### Business problem
2–3 bullets max.

### Snowflake workload
One tight paragraph.

### Stakeholders
- Business: …
- Technical: …

### Data required
Compact bullet list.

### Timeline (2 weeks)
Table or short bullets with week/day ranges and milestones.

### Success criteria
Exactly 3 measurable outcomes.

### Expected follow-on expansion
One short paragraph.

### AE / SE next steps
3 bullets for the next 48 hours.`,
}
