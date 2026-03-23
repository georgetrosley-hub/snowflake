"use client";

import type { ReactNode } from "react";
import type { PriorityAccount } from "@/data/territory-data";
import { buildPovPlanFromPriorityAccount, type PovPlan } from "@/data/pov-plans";
import { buildPovPlanGenerationPrompt } from "@/lib/prompts/pov-plan";
import { cn } from "@/lib/utils";
import {
  BookOpenCheck,
  Briefcase,
  Cpu,
  Database,
  Flag,
  GitBranch,
  Target,
  Timer,
  Users,
  Zap,
} from "lucide-react";

interface PovPlanModuleProps {
  priorityAccount: PriorityAccount;
  onGeneratePovPlan: (prompt: string) => void;
}

export function PovPlanModule({ priorityAccount, onGeneratePovPlan }: PovPlanModuleProps) {
  const plan: PovPlan = buildPovPlanFromPriorityAccount(priorityAccount);
  const prompt = buildPovPlanGenerationPrompt(priorityAccount, plan);

  return (
    <section
      id="pov-plan"
      className="scroll-mt-24 rounded-xl border border-accent/15 bg-gradient-to-b from-accent/[0.06] to-transparent"
    >
      <div className="border-b border-surface-border/35 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-accent" strokeWidth={1.8} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent/90">
                POV Plan
              </p>
            </div>
            <h2 className="mt-2 text-[16px] font-semibold tracking-tight text-text-primary">
              {priorityAccount.name}
            </h2>
            <p className="mt-1 text-[11px] text-text-faint">
              Hypothesis → focused motion → measurable outcome → expansion
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGeneratePovPlan(prompt)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-accent/90"
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={2} />
            Generate POV Plan
          </button>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <PovBlock
          icon={Flag}
          title="Objective"
          summary="Business outcome this POV proves"
        >
          <p className="text-[13px] font-medium leading-snug text-text-primary">{plan.objective}</p>
        </PovBlock>

        <div className="grid gap-4 lg:grid-cols-2">
          <PovBlock
            icon={Briefcase}
            title="Business problem"
            summary="Pain or constraint"
          >
            <p className="text-[13px] leading-relaxed text-text-secondary">{plan.businessProblem}</p>
          </PovBlock>
          <PovBlock
            icon={Cpu}
            title="Snowflake workload"
            summary="What you’re proposing to run"
          >
            <p className="text-[13px] leading-relaxed text-text-secondary">{plan.snowflakeWorkload}</p>
          </PovBlock>
        </div>

        <PovBlock icon={Users} title="Stakeholders" summary="Business + technical coverage">
          <div className="grid gap-2 sm:grid-cols-2">
            {plan.stakeholders.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-surface-border/40 bg-surface-elevated/50 px-3 py-2"
              >
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    s.kind === "business"
                      ? "bg-accent/10 text-accent/90"
                      : "bg-surface-muted text-text-muted"
                  )}
                >
                  {s.kind}
                </span>
                <span className="text-[12px] text-text-secondary">{s.title}</span>
              </div>
            ))}
          </div>
        </PovBlock>

        <PovBlock icon={Database} title="Data required" summary="Minimum viable inputs">
          <ul className="space-y-1.5">
            {plan.dataRequired.map((d, i) => (
              <li key={i} className="flex gap-2 text-[12px] text-text-secondary">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/50" />
                {d}
              </li>
            ))}
          </ul>
        </PovBlock>

        <PovBlock icon={Timer} title="Timeline" summary="2-week POV · milestone steps">
          <div className="space-y-2">
            {plan.timeline.map((row, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-surface-border/35 bg-surface-elevated/40 px-3 py-2 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="shrink-0 text-[11px] font-semibold text-accent/90">{row.period}</span>
                <span className="text-[12px] text-text-secondary">{row.milestone}</span>
              </div>
            ))}
          </div>
        </PovBlock>

        <PovBlock icon={Target} title="Success criteria" summary="Three measurable outcomes">
          <ul className="space-y-2">
            {plan.successCriteria.map((c, i) => (
              <li key={i} className="flex gap-2 text-[12px] text-text-secondary">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/15 text-[10px] font-bold text-accent">
                  {i + 1}
                </span>
                {c}
              </li>
            ))}
          </ul>
        </PovBlock>

        <PovBlock
          icon={GitBranch}
          title="Expected follow-on expansion"
          summary="What this POV unlocks if it lands"
        >
          <p className="text-[13px] leading-relaxed text-text-secondary">{plan.followOnExpansion}</p>
        </PovBlock>
      </div>
    </section>
  );
}

function PovBlock({
  icon: Icon,
  title,
  summary,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-surface-border/35 bg-surface-elevated/40 p-4">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-faint" strokeWidth={1.8} />
        <div>
          <h3 className="text-[12px] font-semibold text-text-primary">{title}</h3>
          <p className="text-[10px] text-text-faint">{summary}</p>
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
