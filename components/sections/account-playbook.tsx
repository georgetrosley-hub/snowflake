"use client";

import type { PriorityAccount } from "@/data/territory-data";
import { cn } from "@/lib/utils";
import {
  FileText,
  HelpCircle,
  BookOpenCheck,
  FileBarChart,
  Mail,
  Users,
  ChevronRight,
} from "lucide-react";

function toBullets(text: string, max: number): string[] {
  const parts = text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.slice(0, max).map((s) => (s.endsWith(".") ? s : `${s}`));
}

function whyMattersBullets(whyMatters: string): string[] {
  const sentences = whyMatters.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 3);
}

function confirmFirstBullets(confirmFirst: string): string[] {
  return toBullets(confirmFirst, 4);
}

const AI_ACTIONS = [
  { id: "brief", label: "Generate Account Brief", icon: FileText },
  { id: "discovery", label: "Generate Discovery Questions", icon: HelpCircle },
  { id: "pov", label: "Generate POV Plan", icon: BookOpenCheck },
  { id: "signals", label: "Summarize Signals", icon: FileBarChart },
  { id: "followup", label: "Draft Executive Follow Up", icon: Mail },
  { id: "stakeholders", label: "Map Stakeholders", icon: Users },
] as const;

interface AccountPlaybookProps {
  account: PriorityAccount;
  onOpenStrategy?: () => void;
}

export function AccountPlaybook({ account, onOpenStrategy }: AccountPlaybookProps) {
  const whyBullets = whyMattersBullets(account.whyMatters);
  const confirmBullets = confirmFirstBullets(account.confirmFirst);

  return (
    <div className="space-y-8">
      {/* 1. Account Header */}
      <header className="rounded-xl border border-surface-border/35 bg-surface-elevated/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-text-primary">
              {account.name}
            </h1>
            <p className="mt-1 text-[12px] font-medium uppercase tracking-wider text-text-faint">
              {account.industry}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent/90">
                P{account.priority}
              </span>
              <span className="rounded-md bg-surface-muted/50 px-2.5 py-1 text-[11px] text-text-secondary">
                {account.status}
              </span>
            </div>
          </div>
          <div className="min-w-0 max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">
              Primary wedge
            </p>
            <p className="mt-1 text-[13px] text-text-secondary">
              {account.expansionWedge}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-text-faint">
              Current motion
            </p>
            <p className="mt-1 text-[13px] text-text-secondary">
              {account.currentMotion}
            </p>
          </div>
        </div>
      </header>

      {/* 2. Why This Account Matters */}
      <SectionCard
        title="Why This Account Matters"
        summary="Strategic rationale for prioritization"
      >
        <ul className="space-y-2">
          {whyBullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
              {b}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 3. Best Expansion Wedge */}
      <SectionCard
        title="Best Expansion Wedge"
        summary="Highest-probability entry point"
      >
        <p className="text-[13px] leading-relaxed text-text-secondary">
          {account.expansionWedge}
        </p>
      </SectionCard>

      {/* 4. Competitive Context */}
      <SectionCard
        title="Competitive Context"
        summary="How we win and where they are"
      >
        <ul className="space-y-2">
          {account.competitiveContext.map((b, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
              {b}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 5. What to Confirm First */}
      <SectionCard
        title="What to Confirm First"
        summary="Validate before advancing"
      >
        <ul className="space-y-2">
          {confirmBullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
              {b}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* 6. POV Hypothesis */}
      <SectionCard
        title="POV Hypothesis"
        summary="Business problem, workload, value"
      >
        <p className="text-[13px] font-medium leading-relaxed text-text-primary">
          {account.povHypothesis}
        </p>
      </SectionCard>

      {/* 7. Recommended Next Action */}
      <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-accent/80">
          Recommended next action
        </p>
        <p className="mt-2 text-[14px] font-medium leading-relaxed text-text-primary">
          {account.nextAction}
        </p>
      </div>

      {/* 8. AI-Assisted Execution Actions */}
      <SectionCard
        title="Execution Actions"
        summary="Generate artifacts via Strategy panel"
      >
        <div className="flex flex-wrap gap-2">
          {AI_ACTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={onOpenStrategy}
              className="inline-flex items-center gap-2 rounded-lg border border-surface-border/40 bg-surface-elevated/50 px-3 py-2.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-accent/25 hover:bg-accent/5 hover:text-text-primary"
            >
              <Icon className="h-3.5 w-3.5 text-accent/70" strokeWidth={1.8} />
              {label}
              <ChevronRight className="h-3 w-3 text-text-faint" strokeWidth={2} />
            </button>
          ))}
        </div>
      </SectionCard>

      {/* 9. Expansion Path */}
      <SectionCard
        title="Expansion Path"
        summary="After first workload lands"
      >
        <div className="flex flex-wrap items-center gap-2">
          {account.expansionPathSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-lg border px-3 py-2 text-[12px] font-medium",
                  i === 0
                    ? "border-accent/30 bg-accent/10 text-accent/90"
                    : "border-surface-border/40 bg-surface-muted/30 text-text-secondary"
                )}
              >
                {step}
              </span>
              {i < account.expansionPathSteps.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-text-faint" strokeWidth={2} />
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function SectionCard({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-surface-border/35 bg-surface-elevated/40 overflow-hidden">
      <div className="border-b border-surface-border/35 px-6 py-4">
        <h2 className="text-[13px] font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
        <p className="mt-0.5 text-[11px] text-text-faint">{summary}</p>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
