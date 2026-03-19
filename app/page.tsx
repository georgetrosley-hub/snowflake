"use client";

import { useEffect, useRef, useState } from "react";
import { AppProvider, useApp } from "@/app/context/app-context";
import { Sidebar, type SectionId } from "@/components/layout/sidebar";
import { StatusBar } from "@/components/layout/status-bar";
import { ChatPanel } from "@/components/layout/chat-panel";
import { Overview } from "@/components/sections/overview";
import { motion, AnimatePresence } from "framer-motion";

function MainContent() {
  const [activeSection, setActiveSection] = useState<SectionId>("territoryPriorities");
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const {
    account,
    accounts,
    competitors,
    signals,
    stakeholders,
    executionItems,
    accountUpdates,
    workspaceDraft,
    currentRecommendation,
    pipelineTarget,
    pendingDecisionCount,
    dealHealth,
    setAccountId,
    updateWorkspaceField,
    addAccountUpdate,
  } = useApp();

  const handleSectionChange = (section: SectionId) => {
    setActiveSection(section);
    setMobileNavOpen(false);
  };

  useEffect(() => {
    // Ensure each section loads from the top of the scroll container.
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeSection]);

  const handleOpenChat = () => {
    setChatOpen(true);
    setMobileNavOpen(false);
  };

  const handleAccountChange = (accountId: string) => {
    setAccountId(accountId);
    setMobileNavOpen(false);
  };

  const oversightStatus = pendingDecisionCount > 0 ? "active" as const : "idle" as const;

  const overviewNode = (
    <Overview
      account={account}
      competitors={competitors}
      signals={signals}
      stakeholders={stakeholders}
      executionItems={executionItems}
      accountUpdates={accountUpdates}
      workspaceDraft={workspaceDraft}
      pipelineTarget={pipelineTarget}
      currentRecommendation={currentRecommendation}
      dealHealth={dealHealth}
      onUpdateWorkspaceField={updateWorkspaceField}
      onAddAccountUpdate={addAccountUpdate}
      activeSection={activeSection}
    />
  );

  const sections: Record<SectionId, React.ReactNode> = {
    territoryPriorities: overviewNode,
    dailyBriefing: overviewNode,
    accountDossiers: overviewNode,
    operatingPriorities: overviewNode,
    executionFramework: overviewNode,
    briefingEngine: overviewNode,
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-surface pb-[env(safe-area-inset-bottom)] lg:flex lg:h-screen">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onOpenChat={handleOpenChat}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(41,181,232,0.06),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(41,181,232,0.04),transparent_55%)]" />

        <StatusBar
          account={account}
          accounts={accounts}
          onAccountChange={handleAccountChange}
          signalCount={signals.length}
          pendingDecisions={pendingDecisionCount}
          oversightStatus={oversightStatus}
          dealHealth={dealHealth}
          onOpenChat={handleOpenChat}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main
          ref={mainScrollRef as unknown as React.RefObject<HTMLElement>}
          className="relative flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mx-auto w-full max-w-6xl min-w-0"
            >
              {sections[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        account={account}
        competitors={competitors}
        activeSection={activeSection}
      />
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
