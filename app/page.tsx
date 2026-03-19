"use client";

import { useEffect, useRef, useState } from "react";
import { AppProvider, useApp } from "@/app/context/app-context";
import { Sidebar, type SectionId } from "@/components/layout/sidebar";
import { StatusBar } from "@/components/layout/status-bar";
import { ChatPanel } from "@/components/layout/chat-panel";
import { Overview } from "@/components/sections/overview";

const ORDERED_SECTIONS: ReadonlyArray<{ sectionId: SectionId; anchorId: string }> = [
  { sectionId: "territoryPriorities", anchorId: "territory-priorities" },
  { sectionId: "dailyBriefing", anchorId: "daily-account-briefing" },
  { sectionId: "operatingPriorities", anchorId: "operating-priorities" },
  { sectionId: "accountDossiers", anchorId: "account-dossiers" },
  { sectionId: "executionFramework", anchorId: "execution-framework" },
  { sectionId: "briefingEngine", anchorId: "briefing-engine" },
] as const;
const ACTIVATION_OFFSET_PX = 120;

function MainContent() {
  const [activeSection, setActiveSection] = useState<SectionId>("territoryPriorities");
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const activeSectionRef = useRef<SectionId>("territoryPriorities");
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
    activeSectionRef.current = section;
    setMobileNavOpen(false);
    const targetId = ORDERED_SECTIONS.find((item) => item.sectionId === section)?.anchorId;
    const targetElement = targetId ? document.getElementById(targetId) : null;
    targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
      onSelectAccount={handleAccountChange}
      onUpdateWorkspaceField={updateWorkspaceField}
      onAddAccountUpdate={addAccountUpdate}
    />
  );

  useEffect(() => {
    const scrollContainer = mainScrollRef.current;
    if (!scrollContainer) return;

    const sectionEntries = ORDERED_SECTIONS
      .map(({ sectionId, anchorId }) => {
        const element = document.getElementById(anchorId);
        return element ? { sectionId, element } : null;
      })
      .filter((entry): entry is { sectionId: SectionId; element: HTMLElement } => entry !== null);

    if (!sectionEntries.length) return;
    if (process.env.NODE_ENV === "development" && sectionEntries.length !== ORDERED_SECTIONS.length) {
      const found = new Set(sectionEntries.map((entry) => entry.sectionId));
      const missing = ORDERED_SECTIONS.filter((item) => !found.has(item.sectionId)).map(
        (item) => `${item.sectionId}#${item.anchorId}`
      );
      if (missing.length) {
        console.warn("Scrollspy missing sections:", missing.join(", "));
      }
    }

    const getSectionTops = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const baseScrollTop = scrollContainer.scrollTop;
      const tops = sectionEntries.map(({ sectionId, element }) => ({
        sectionId,
        top: baseScrollTop + (element.getBoundingClientRect().top - containerRect.top),
      }));
      if (process.env.NODE_ENV === "development") {
        for (let i = 1; i < tops.length; i += 1) {
          if (tops[i].top < tops[i - 1].top) {
            console.warn("Scrollspy section order is not ascending:", tops);
            break;
          }
        }
      }
      return tops;
    };

    let frameRequested = false;
    const updateScrollState = () => {
      const scrollTop = scrollContainer.scrollTop;
      const maxScroll = Math.max(scrollContainer.scrollHeight - scrollContainer.clientHeight, 1);
      const nextProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      setScrollProgress((prev) => (Math.abs(prev - nextProgress) > 0.002 ? nextProgress : prev));

      const sectionTops = getSectionTops();
      const activationLine = scrollTop + ACTIVATION_OFFSET_PX;
      let nextActive = sectionTops[0]?.sectionId ?? activeSectionRef.current;
      for (const section of sectionTops) {
        if (section.top <= activationLine) {
          nextActive = section.sectionId;
        } else {
          break;
        }
      }
      if (scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 2) {
        nextActive = sectionTops[sectionTops.length - 1]?.sectionId ?? nextActive;
      }
      if (nextActive !== activeSectionRef.current) {
        activeSectionRef.current = nextActive;
        setActiveSection(nextActive);
      }

      frameRequested = false;
    };
    const requestScrollStateUpdate = () => {
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(updateScrollState);
    };

    const onScroll = () => requestScrollStateUpdate();
    const onResize = () => requestScrollStateUpdate();

    updateScrollState();
    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-surface pb-[env(safe-area-inset-bottom)] lg:flex lg:h-screen">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onOpenChat={handleOpenChat}
        collapsed={sidebarCollapsed}
        scrollProgress={scrollProgress}
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
          <div className="mx-auto w-full max-w-6xl min-w-0">{overviewNode}</div>
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
