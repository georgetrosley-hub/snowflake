"use client";

import { useState } from "react";
import { AppProvider, useApp } from "@/app/context/app-context";
import { Sidebar, type SectionId } from "@/components/layout/sidebar";
import { StatusBar } from "@/components/layout/status-bar";
import { CommandCenter } from "@/components/sections/command-center";
import { LiveAgentFeed } from "@/components/sections/live-agent-feed";
import { OrgExpansionMap } from "@/components/sections/org-expansion-map";
import { CompetitiveBattlefield } from "@/components/sections/competitive-battlefield";
import { ArchitectureSecurity } from "@/components/sections/architecture-security";
import { DealTimeline } from "@/components/sections/deal-timeline";
import { ApprovalQueue } from "@/components/sections/approval-queue";
import { ExecutiveNarrative } from "@/components/sections/executive-narrative";
import { motion, AnimatePresence } from "framer-motion";

function MainContent() {
  const [activeSection, setActiveSection] = useState<SectionId>("command");
  const {
    account,
    accounts,
    agents,
    events,
    approvals,
    orgNodes,
    competitors,
    dealStages,
    currentRecommendation,
    pipelineTarget,
    setAccountId,
    lastApprovedTitle,
    clearLastApproved,
    handleApprove,
    handleReject,
    handleModify,
  } = useApp();

  const forecastData = [
    { month: "M1", land: account.estimatedLandValue * 0.1, expansion: 0 },
    { month: "M3", land: account.estimatedLandValue * 0.4, expansion: account.estimatedExpansionValue * 0.05 },
    { month: "M6", land: account.estimatedLandValue * 0.8, expansion: account.estimatedExpansionValue * 0.2 },
    { month: "M9", land: account.estimatedLandValue, expansion: account.estimatedExpansionValue * 0.4 },
    { month: "M12", land: account.estimatedLandValue, expansion: account.estimatedExpansionValue * 0.7 },
  ];

  const estimatedArr = account.estimatedLandValue + orgNodes.reduce((s, n) => s + n.arrPotential, 0) * 0.3;
  const currentStage = dealStages.find((s) => s.current);
  const activeAgentsCount = agents.filter((a) => a.status !== "idle").length;
  const oversightStatus = approvals.some((a) => a.status === "pending") ? "active" as const : "idle" as const;

  const sections: Record<SectionId, React.ReactNode> = {
    command: (
      <CommandCenter
        account={account}
        agents={agents}
        competitors={competitors}
        currentRecommendation={currentRecommendation}
        forecastData={forecastData}
      />
    ),
    feed: <LiveAgentFeed events={events} />,
    org: <OrgExpansionMap nodes={orgNodes} />,
    competitive: <CompetitiveBattlefield competitors={competitors} />,
    architecture: <ArchitectureSecurity account={account} />,
    timeline: <DealTimeline stages={dealStages} />,
    approval: (
      <ApprovalQueue
        approvals={approvals}
        lastApprovedTitle={lastApprovedTitle}
        clearLastApproved={clearLastApproved}
        onApprove={handleApprove}
        onReject={handleReject}
        onModify={handleModify}
      />
    ),
    narrative: <ExecutiveNarrative account={account} />,
  };

  return (
    <div className="relative flex h-screen bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(196,181,154,0.12),transparent_34%),radial-gradient(circle_at_78%_0%,rgba(255,255,255,0.06),transparent_30%)]" />
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <StatusBar
          account={account}
          accounts={accounts}
          onAccountChange={setAccountId}
          pipelineTarget={pipelineTarget}
          estimatedArr={estimatedArr}
          dealStage={currentStage?.label ?? "Pilot design"}
          activeAgents={activeAgentsCount}
          oversightStatus={oversightStatus}
        />
        <main className="relative flex-1 overflow-y-auto px-8 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mx-auto max-w-6xl"
            >
              {sections[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
