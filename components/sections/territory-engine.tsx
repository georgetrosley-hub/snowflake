"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { ClaudeActionBar } from "@/components/ui/claude-action-bar";
import { SectionHeader } from "@/components/ui/section-header";
import type { Account, Competitor } from "@/types";

interface TerritoryEngineProps {
  account: Account;
  competitors: Competitor[];
}

export function TerritoryEngine({ account, competitors }: TerritoryEngineProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Territory engine"
        subtitle="Land net-new logos and expand consumption and use cases within existing customers. Generate pipeline and move deals for this account."
      />

      <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3">
        <Zap className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.8} />
        <p className="text-[13px] text-text-primary">
          Pick an action for {account.name} or ask a custom question to build pipeline and advance the deal.
        </p>
      </div>

      <ClaudeActionBar
        title="Territory engine"
        subtitle="Generate pipeline, expansion plays, champion maps, outreach, and pilot designs for net-new and expansion within your selected account."
        account={account}
        competitors={competitors}
        actions={[
          {
            id: "scan-ai-signals",
            label: "Scan for AI adoption signals",
            prompt: `For ${account.name} (${account.employeeCount.toLocaleString()} employees, ${account.developerPopulation.toLocaleString()} developers, AI maturity ${account.aiMaturityScore}/100): What signals would indicate they're actively adopting AI? Consider job postings, digital transformation mandates, vendor footprint (${account.existingVendorFootprint.join(", ")}), and executive priorities. Give me 5–7 concrete signals to look for and where to find them.`,
          },
          {
            id: "map-champions",
            label: "Map likely champions",
            prompt: `For ${account.name}, who are the most likely champions for a first wedge around "${account.firstWedge}"? Use their executive sponsors (${account.executiveSponsors.join("; ")}), org structure, and the wedge. Give me 3–5 likely champion profiles: role, title, what they care about, and how to identify/reach them. Be specific to this account.`,
          },
          {
            id: "generate-outreach",
            label: "Generate outreach",
            prompt: `Write a short, punchy outreach email (under 150 words) to a potential champion at ${account.name}. The wedge is: ${account.firstWedge}. Their existing vendors include ${account.existingVendorFootprint.join(", ")}. Make it specific to their context—not generic. Include a clear, low-friction ask.`,
          },
          {
            id: "simulate-objections",
            label: "Anticipate objections",
            prompt: `For ${account.name}, what are the top 5 objections I'll hear from security, legal, procurement, or the incumbent (${account.existingVendorFootprint.join(", ")})? For each, give me: the objection, why they'll say it, and a 2–3 sentence response I can use in the room. Account blockers: ${account.topBlockers.join("; ")}.`,
          },
          {
            id: "design-pilot",
            label: "Design pilot structure",
            prompt: `Design a 90-day pilot structure for ${account.name} around "${account.firstWedge}". Include: scope (who, what systems, what success looks like), success metrics (3–5 measurable), security/governance path (they're ${account.securitySensitivity}% security-sensitive), and expansion thesis. Make it something I could present to the champion and economic buyer.`,
          },
        ]}
      />
    </motion.div>
  );
}
