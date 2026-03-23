"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  Clipboard,
  Loader2,
  Workflow,
} from "lucide-react";
import { useApiKey } from "@/app/context/api-key-context";
import { useApp } from "@/app/context/app-context";
import { useTerritoryData } from "@/app/context/territory-data-context";
import { useToast } from "@/app/context/toast-context";
import type { PriorityAccount } from "@/data/territory-data";
import { cn } from "@/lib/utils";
import { readApiErrorMessage } from "@/lib/client/api";

type PhaseId = "brief" | "discovery" | "pov" | "expansion";

type ActionId =
  | "account_brief"
  | "discovery_questions"
  | "pov_plan"
  | "signals_summary"
  | "exec_followup"
  | "stakeholder_map";

const PROMPT_TYPE: Record<ActionId, string> = {
  account_brief: "ae_account_brief",
  discovery_questions: "ae_discovery_questions",
  pov_plan: "ae_pov_plan",
  signals_summary: "ae_signals_summary",
  exec_followup: "ae_exec_followup",
  stakeholder_map: "ae_stakeholder_map",
};

type PhaseConfig = {
  id: PhaseId;
  label: string;
  hint: string;
  actions: { id: ActionId; label: string }[];
};

const PHASES: PhaseConfig[] = [
  {
    id: "brief",
    label: "Brief",
    hint: "Orientation",
    actions: [{ id: "account_brief", label: "Generate Account Brief" }],
  },
  {
    id: "discovery",
    label: "Discovery",
    hint: "Qualification",
    actions: [{ id: "discovery_questions", label: "Generate Discovery Questions" }],
  },
  {
    id: "pov",
    label: "POV",
    hint: "Proof path",
    actions: [{ id: "pov_plan", label: "Generate POV Plan" }],
  },
  {
    id: "expansion",
    label: "Expansion",
    hint: "Momentum",
    actions: [
      { id: "signals_summary", label: "Summarize Recent Signals" },
      { id: "exec_followup", label: "Draft Executive Follow Up" },
      { id: "stakeholder_map", label: "Map Likely Stakeholders" },
    ],
  },
];

function buildTerritoryContext(
  priority: PriorityAccount | undefined,
  accountId: string,
  signals: { timestamp: string; account: string; text: string }[],
  activities: { timestamp: string; account: string; text: string }[]
): string {
  const lines: string[] = [];

  if (priority) {
    lines.push(
      "## Territory profile",
      `- Account: ${priority.name} (${priority.industry})`,
      `- Status: ${priority.status}`,
      `- Why it matters: ${priority.whyMatters}`,
      `- Expansion wedge: ${priority.expansionWedge}`,
      `- Confirm first: ${priority.confirmFirst}`,
      `- POV hypothesis: ${priority.povHypothesis}`,
      `- Next action (baseline): ${priority.nextAction}`,
      `- Competitive context: ${priority.competitiveContext.join(" · ")}`,
      `- Current motion: ${priority.currentMotion}`
    );
  }

  const scopedSignals = signals.filter((s) => s.account === accountId).slice(0, 8);
  const scopedActivity = activities.filter((a) => a.account === accountId).slice(0, 8);

  lines.push("", "## Recent signals (curated log)");
  if (scopedSignals.length === 0) {
    lines.push("- None logged for this account in the tracker.");
  } else {
    for (const s of scopedSignals) {
      lines.push(`- ${s.timestamp}: ${s.text}`);
    }
  }

  lines.push("", "## Recent activity");
  if (scopedActivity.length === 0) {
    lines.push("- None logged for this account in the feed.");
  } else {
    for (const a of scopedActivity) {
      lines.push(`- ${a.timestamp}: ${a.text}`);
    }
  }

  return lines.join("\n");
}

const mdComponents = {
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
    <h1 className="mt-3 first:mt-0 text-[13px] font-semibold text-text-primary" {...props} />
  ),
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-3 first:mt-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-faint" {...props} />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-2 first:mt-0 text-[12px] font-semibold text-text-primary" {...props} />
  ),
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p className="mt-2 first:mt-0 text-[12px] leading-relaxed text-text-secondary" {...props} />
  ),
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-text-primary" {...props} />
  ),
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-2 list-disc space-y-1 pl-4" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-2 list-decimal space-y-1 pl-4" {...props} />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => (
    <li className="text-[12px] leading-relaxed text-text-secondary" {...props} />
  ),
  table: (props: React.ComponentPropsWithoutRef<"table">) => (
    <div className="mt-2 overflow-x-auto rounded-lg border border-surface-border/40">
      <table className="min-w-full border-collapse text-left text-[11px]" {...props} />
    </div>
  ),
  thead: (props: React.ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-surface-muted/40 text-[10px] uppercase tracking-wide text-text-faint" {...props} />
  ),
  th: (props: React.ComponentPropsWithoutRef<"th">) => (
    <th className="border-b border-surface-border/40 px-2 py-1.5 font-medium" {...props} />
  ),
  td: (props: React.ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-surface-border/30 px-2 py-1.5 text-text-secondary" {...props} />
  ),
  code: (props: React.ComponentPropsWithoutRef<"code">) => (
    <code className="rounded bg-surface-muted/50 px-1 py-0.5 font-mono text-[11px] text-text-primary" {...props} />
  ),
};

export function AccountExecutionPanel() {
  const { account, competitors } = useApp();
  const { signals, activities, priorityAccounts } = useTerritoryData();
  const { hasApiKey, getRequestHeaders } = useApiKey();
  const { showToast } = useToast();

  const priority = useMemo(
    () => priorityAccounts.find((p) => p.id === account.id),
    [account.id, priorityAccounts]
  );

  const territoryContext = useMemo(
    () => buildTerritoryContext(priority, account.id, signals, activities),
    [priority, account.id, signals, activities]
  );

  const [phase, setPhase] = useState<PhaseId>("brief");
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [outputs, setOutputs] = useState<Partial<Record<ActionId, string>>>({});
  const [loading, setLoading] = useState<ActionId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    setOutputs({});
    setActiveAction(null);
    setLoading(null);
    setError(null);
    setPhase("brief");
  }, [account.id]);

  const phaseActions = useMemo(
    () => PHASES.find((p) => p.id === phase)?.actions ?? [],
    [phase]
  );

  const runAction = useCallback(
    async (actionId: ActionId) => {
      setActiveAction(actionId);
      setError(null);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(actionId);
      setOutputs((prev) => {
        const next = { ...prev };
        delete next[actionId];
        return next;
      });

      let assembled = "";

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getRequestHeaders(),
          },
          body: JSON.stringify({
            type: PROMPT_TYPE[actionId],
            account,
            competitors,
            context: territoryContext,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await readApiErrorMessage(response));
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data) as { text?: string };
              if (parsed.text) {
                assembled += parsed.text;
              }
            } catch {
              // skip malformed frames
            }
          }
        }

        setOutputs((prev) => ({ ...prev, [actionId]: assembled.trim() }));
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Could not complete this run.");
      } finally {
        setLoading(null);
        abortRef.current = null;
      }
    },
    [account, competitors, getRequestHeaders, territoryContext]
  );

  const copyOutput = useCallback(
    async (actionId: ActionId) => {
      const text = outputs[actionId];
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard");
      } catch {
        showToast("Copy failed");
      }
    },
    [outputs, showToast]
  );

  const activeOutput = activeAction ? outputs[activeAction] : null;
  const isLoading = loading !== null;

  return (
    <section
      className="scroll-mt-24 rounded-2xl border border-surface-border/50 bg-surface-elevated/35 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
      aria-label="Account workflow execution"
    >
      <div className="border-b border-surface-border/40 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border/50 bg-surface-muted/30">
              <Workflow className="h-4 w-4 text-accent" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold tracking-tight text-text-primary">
                Account workflow
              </h2>
              <p className="mt-0.5 text-[11px] text-text-muted">
                Structured runs for reviews—brief → discovery → POV → expansion.
              </p>
            </div>
          </div>
          <div className="rounded-full border border-surface-border/50 bg-surface-muted/25 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-text-faint">
            {account.name}
          </div>
        </div>

        {!hasApiKey && (
          <p className="mt-3 rounded-lg border border-accent/20 bg-accent/[0.06] px-3 py-2 text-[11px] text-accent/95">
            Add your API key in the header to generate outputs. Saved results stay in this session until refreshed.
          </p>
        )}
      </div>

      <div className="grid gap-0 lg:grid-cols-[220px_1fr] lg:divide-x lg:divide-surface-border/40">
        <div className="p-4 sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-faint">Phase</p>
          <div className="mt-2 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {PHASES.map((p) => {
              const isActive = phase === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPhase(p.id)}
                  className={cn(
                    "flex min-w-[132px] flex-col rounded-lg px-3 py-2 text-left transition-colors lg:min-w-0",
                    isActive
                      ? "border border-accent/30 bg-accent/[0.08]"
                      : "border border-transparent hover:bg-surface-muted/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-[12px] font-semibold",
                      isActive ? "text-accent" : "text-text-secondary"
                    )}
                  >
                    {p.label}
                  </span>
                  <span className="text-[10px] text-text-faint">{p.hint}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.14em] text-text-faint">Actions</p>
          <div className="mt-2 space-y-1.5">
            {phaseActions.map((a) => {
              const done = Boolean(outputs[a.id]);
              const running = loading === a.id;
              const selected = activeAction === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setActiveAction(a.id);
                    void runAction(a.id);
                  }}
                  disabled={isLoading}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[11px] font-medium transition-colors",
                    selected
                      ? "border-accent/35 bg-accent/[0.07] text-text-primary"
                      : "border-surface-border/45 bg-surface-muted/20 text-text-secondary hover:border-accent/25",
                    isLoading && !running && "opacity-60"
                  )}
                >
                  <span className="min-w-0 leading-snug">{a.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {running && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
                    {done && !running && <Check className="h-3.5 w-3.5 text-emerald-400/90" strokeWidth={2.2} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-[280px] p-4 sm:p-5">
          {!activeAction && (
            <div className="flex h-full min-h-[240px] flex-col justify-center rounded-xl border border-dashed border-surface-border/55 bg-surface-muted/15 px-4 py-8 text-center">
              <p className="text-[13px] font-medium text-text-primary">Select a workflow step</p>
              <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-text-muted">
                Choose a phase, then run an action. Output is formatted for fast scanning, CRM notes, and follow-up drafts.
              </p>
            </div>
          )}

          {activeAction && (
            <div className="flex h-full flex-col rounded-xl border border-surface-border/45 bg-surface-muted/10">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border/35 px-3 py-2 sm:px-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint">Output</p>
                  <p className="truncate text-[12px] font-semibold text-text-primary">
                    {phaseActions.find((a) => a.id === activeAction)?.label ?? activeAction}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyOutput(activeAction)}
                  disabled={!activeOutput || isLoading}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                    activeOutput && !isLoading
                      ? "border-accent/25 bg-accent/[0.08] text-accent hover:bg-accent/[0.12]"
                      : "cursor-not-allowed border-surface-border/40 text-text-faint"
                  )}
                >
                  <Clipboard className="h-3.5 w-3.5" strokeWidth={2} />
                  Copy
                </button>
              </div>

              {isLoading && loading === activeAction && (
                <div className="relative h-0.5 w-full overflow-hidden bg-surface-border/40">
                  <motion.div
                    className="absolute inset-y-0 w-1/3 bg-accent/35"
                    initial={false}
                    animate={{ x: ["-100%", "320%"] }}
                    transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}

              <div className="max-h-[min(420px,55vh)] flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
                {error && (
                  <p className="rounded-lg border border-rose-400/25 bg-rose-500/[0.08] px-3 py-2 text-[12px] text-rose-200/95">
                    {error}
                  </p>
                )}

                {isLoading && loading === activeAction && !activeOutput && (
                  <div className="space-y-2 pt-1" aria-busy>
                    <div className="h-2.5 w-2/3 animate-pulse rounded bg-surface-muted/60" />
                    <div className="h-2.5 w-full animate-pulse rounded bg-surface-muted/50" />
                    <div className="h-2.5 w-5/6 animate-pulse rounded bg-surface-muted/45" />
                    <div className="h-2.5 w-4/6 animate-pulse rounded bg-surface-muted/40" />
                    <p className="pt-2 text-[11px] text-text-faint">Generating structured output…</p>
                  </div>
                )}

                {activeOutput && (
                  <article className="min-w-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                      {activeOutput}
                    </ReactMarkdown>
                  </article>
                )}

                {!isLoading && activeAction && !activeOutput && !error && (
                  <p className="text-[12px] text-text-muted">Run the action to populate this panel.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
