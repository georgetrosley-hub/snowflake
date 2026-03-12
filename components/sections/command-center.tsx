"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Account, Agent, Competitor } from "@/types";

const ease = [0.25, 0.46, 0.45, 0.94];

interface CommandCenterProps {
  account: Account;
  agents: Agent[];
  competitors: Competitor[];
  currentRecommendation: string;
  forecastData: { month: string; land: number; expansion: number }[];
}

export function CommandCenter({
  account,
  competitors,
  currentRecommendation,
  forecastData,
}: CommandCenterProps) {
  const topCompetitors = competitors
    .filter((c) => c.accountRiskLevel >= 70)
    .sort((a, b) => b.accountRiskLevel - a.accountRiskLevel)
    .slice(0, 3);

  const totalOpportunity = account.estimatedLandValue + account.estimatedExpansionValue;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease }}
      className="min-h-[70vh]"
    >
      {/* Hero */}
      <section className="mb-20">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease }}
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted mb-3"
        >
          Anthropic enterprise motion
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease }}
          className="text-[11px] uppercase tracking-[0.16em] text-text-faint mb-6"
        >
          Target account
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          className="text-4xl sm:text-5xl font-medium tracking-tight text-text-primary"
        >
          {account.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease }}
          className="mt-4 text-lg text-text-secondary leading-relaxed max-w-2xl"
        >
          {account.firstWedge}
        </motion.p>
      </section>

      {/* Premium metric panel */}
      <section className="mb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease }}
          className="flex flex-col gap-12 sm:flex-row sm:gap-16 lg:gap-24 py-10 border-y border-surface-border/40"
        >
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint mb-2">
              Land
            </p>
            <p className="text-3xl sm:text-4xl font-medium tabular-nums text-text-primary tracking-tight">
              ${account.estimatedLandValue.toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint mb-2">
              Expansion
            </p>
            <p className="text-3xl sm:text-4xl font-medium tabular-nums text-text-primary tracking-tight">
              ${account.estimatedExpansionValue.toFixed(2)}M
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint mb-2">
              Opportunity
            </p>
            <p className="text-3xl sm:text-4xl font-medium tabular-nums text-accent-muted/90 tracking-tight">
              ${totalOpportunity.toFixed(2)}M
            </p>
          </div>
        </motion.div>
      </section>

      {/* Forecast */}
      <section className="mb-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint mb-8">
            Pipeline forecast
          </p>
          <div className="h-48 lg:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4b59a" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#c4b59a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9a8f7a" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="#9a8f7a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#2c2824" vertical={false} strokeOpacity={0.5} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#6e6860" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6e6860" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1c19",
                    border: "1px solid #2c2824",
                    borderRadius: "4px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: "#b8b2a9", fontSize: 11 }}
                  formatter={(value: number) => [`$${value.toFixed(2)}M`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="land"
                  stroke="#c4b59a"
                  strokeWidth={1}
                  fill="url(#landGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expansion"
                  stroke="#9a8f7a"
                  strokeWidth={0.8}
                  fill="url(#expGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* Context + recommendation */}
      <section className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease }}
          className="space-y-10"
        >
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint mb-4">
              Competitive pressure
            </p>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              {topCompetitors.map((c) => c.name).join(" · ")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint mb-4">
              Blockers
            </p>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              {account.topBlockers.slice(0, 2).join(". ")}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint mb-4">
              Paths
            </p>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              {account.topExpansionPaths.slice(0, 2).join(". ")}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint mb-4">
            Recommendation
          </p>
          <p className="text-[17px] text-text-primary leading-relaxed">
            {currentRecommendation}
          </p>
        </motion.div>
      </section>
    </motion.div>
  );
}
