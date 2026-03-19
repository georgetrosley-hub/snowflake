"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SnowflakeLogoIcon, SnowflakeWordmark } from "@/components/ui/snowflake-logo";
import {
  MessageCircle,
  Target,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Newspaper,
  FileText,
  ClipboardCheck,
  Compass,
  BookOpenCheck,
} from "lucide-react";

const SNOWFLAKE_SUMMIT_URL = "https://www.snowflake.com/en/summit/";

const sectionGroups = [
  {
    label: "Territory Operating System",
    items: [
      { id: "territoryPriorities", label: "Territory Priorities", icon: Target },
      { id: "dailyBriefing", label: "Daily Briefing", icon: Newspaper },
      { id: "accountDossiers", label: "Account Dossiers", icon: FileText },
      { id: "operatingPriorities", label: "Operating Priorities", icon: ClipboardCheck },
      { id: "executionFramework", label: "Execution Framework", icon: Compass },
      { id: "briefingEngine", label: "Briefing Engine", icon: BookOpenCheck },
    ],
  },
] as const;

type SectionItem = (typeof sectionGroups)[number]["items"][number];
export type SectionId = SectionItem["id"];

interface SidebarProps {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
  onOpenChat: () => void;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
}

interface SidebarBodyProps {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
  onOpenChat: () => void;
  compact?: boolean;
  onToggleCollapsed?: () => void;
  onCloseMobile?: () => void;
}

function SidebarBody({
  activeSection,
  onSectionChange,
  onOpenChat,
  compact = false,
  onToggleCollapsed,
  onCloseMobile,
}: SidebarBodyProps) {
  const handleSectionSelect = (id: SectionId) => {
    onSectionChange(id);
    onCloseMobile?.();
  };

  return (
    <>
      <div className={cn("relative px-5 py-5", compact && "px-3 py-4")}>
        <div className="flex items-center justify-between gap-2">
          <div className={cn("flex items-center gap-2", compact && "justify-center")}>
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md">
              <SnowflakeLogoIcon size={24} className="h-full w-full" />
            </div>
            {!compact && (
              <div>
                <SnowflakeWordmark />
                <p className="text-[11px] text-text-muted">
                  Territory Operating System
                </p>
              </div>
            )}
          </div>
          {onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted/40 hover:text-text-secondary lg:inline-flex"
              aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
              title={compact ? "Expand sidebar" : "Collapse sidebar"}
            >
              {compact ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted/40 hover:text-text-secondary lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className={cn("px-3 pb-3", compact && "px-2")}>
        <button
          type="button"
          onClick={() => {
            onOpenChat();
            onCloseMobile?.();
          }}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-accent/20 bg-accent/[0.06] px-3 py-3 text-[12px] font-medium text-accent transition-colors active:bg-accent/10 hover:bg-accent/10",
            compact && "justify-center px-0 py-2 min-h-[40px]"
          )}
          aria-label="Ask"
          title="Ask"
        >
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
          {!compact && "Ask"}
        </button>
      </div>

      <nav className={cn("flex-1 overflow-y-auto px-3 py-1", compact && "px-2")}>
        {sectionGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!compact && (
              <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint/70">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSectionSelect(id)}
                    className={cn(
                      "group flex w-full min-h-[44px] items-center gap-2 rounded-md px-3 py-3 text-left text-[13px] transition-all duration-150 active:bg-surface-muted/40",
                      compact && "justify-center px-0 py-2 min-h-[40px]",
                      isActive
                        ? "bg-surface-muted/50 text-text-primary"
                        : "text-text-muted hover:bg-surface-muted/30 hover:text-text-secondary"
                    )}
                    aria-label={label}
                    title={label}
                  >
                    <Icon
                      className={cn(
                        "h-[14px] w-[14px] shrink-0 transition-colors duration-200",
                        isActive ? "text-accent" : "opacity-45 group-hover:opacity-70"
                      )}
                      strokeWidth={1.8}
                    />
                    {!compact && (
                      <span className={cn(isActive && "font-medium")}>{label}</span>
                    )}
                    {isActive && !compact && (
                      <span className="ml-auto h-1 w-1 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("mt-auto border-t border-surface-border/30 px-5 py-4", compact && "px-3")}>
        <div className={cn("flex items-center gap-2.5", compact && "justify-center")}>
          <SnowflakeLogoIcon size={20} className="shrink-0 opacity-80" />
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-text-secondary">Enterprise AE</p>
              <p className="text-[10px] text-text-faint">Territory ownership + expansion</p>
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <div className="space-y-2 px-5 pb-4">
          <a
            href={SNOWFLAKE_SUMMIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[10px] text-accent/80 hover:text-accent underline underline-offset-2"
          >
            Snowflake Summit →
          </a>
          <p className="text-[10px] text-text-faint/60">
            Enterprise territory execution · snowflake.com
          </p>
        </div>
      )}
    </>
  );
}

export function Sidebar({
  activeSection,
  onSectionChange,
  onOpenChat,
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
}: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 border-r border-surface-border/40 bg-surface-elevated/20 transition-[width] duration-200 lg:flex lg:flex-col",
          collapsed ? "lg:w-20" : "lg:w-56"
        )}
      >
        <SidebarBody
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onOpenChat={onOpenChat}
          compact={collapsed}
          onToggleCollapsed={onToggleCollapsed}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onCloseMobile}
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs flex-col border-r border-surface-border/40 bg-surface shadow-2xl lg:hidden"
            >
              <SidebarBody
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onOpenChat={onOpenChat}
                onCloseMobile={onCloseMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
