"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  KeyRound,
  Menu,
  MessageCircle,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { useApiKey } from "@/app/context/api-key-context";
import { useTheme } from "@/app/context/theme-context";
import { cn } from "@/lib/utils";
import { SnowflakeLogoIcon } from "@/components/ui/snowflake-logo";
import type { Account } from "@/types";
import type { DealHealthSummary } from "@/lib/deal-health";

interface StatusBarProps {
  account: Account;
  accounts: Account[];
  onAccountChange: (id: string) => void;
  signalCount: number;
  pendingDecisions: number;
  oversightStatus: "active" | "idle";
  dealHealth?: DealHealthSummary;
  onOpenChat?: () => void;
  onOpenMobileNav: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function StatusBar({
  account,
  accounts,
  onAccountChange,
  signalCount,
  pendingDecisions,
  oversightStatus,
  dealHealth,
  onOpenChat,
  onOpenMobileNav,
  sidebarCollapsed,
  onToggleSidebar,
}: StatusBarProps) {
  const { apiKey, hasApiKey, isReady, setApiKey, clearApiKey } = useApiKey();
  const { theme, toggleTheme } = useTheme();
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [draftApiKey, setDraftApiKey] = useState("");

  useEffect(() => {
    if (isApiKeyOpen) {
      setDraftApiKey(apiKey);
    }
  }, [apiKey, isApiKeyOpen]);

  return (
    <>
      <header className="shrink-0 border-b border-surface-border/35 bg-surface/40 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onOpenMobileNav}
                className="touch-target inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-surface-border/50 bg-surface-elevated/35 text-text-secondary transition-colors active:bg-surface-muted/30 hover:bg-surface-muted/30 hover:text-text-primary lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden h-9 w-9 items-center justify-center rounded-md border border-surface-border/50 bg-surface-elevated/35 text-text-secondary transition-colors hover:bg-surface-muted/30 hover:text-text-primary lg:inline-flex"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              <div className="relative min-w-0 flex-1 sm:flex-none">
                <select
                  value={account.id}
                  onChange={(e) => onAccountChange(e.target.value)}
                  className={cn(
                    "w-full max-w-full appearance-none rounded bg-transparent py-1.5 pr-7 text-[13px] text-text-primary",
                    "cursor-pointer border-none focus:outline-none focus:ring-0 sm:min-w-[180px]"
                  )}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-surface-elevated text-text-primary">
                      {a.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-surface-border/50 bg-surface-elevated/40 px-2.5 py-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-faint">Territory</span>
                <span className="tabular-nums text-[13px] font-semibold text-accent">
                  {account.name}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-surface-border/50 bg-surface-elevated/35 text-text-muted transition-colors hover:bg-surface-muted/30 hover:text-text-primary"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsApiKeyOpen(true)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-colors",
                  hasApiKey
                    ? "border-accent/25 bg-accent/[0.06] text-accent/90 hover:bg-accent/10"
                    : "border-surface-border/50 bg-surface-elevated/30 text-text-secondary hover:text-text-primary"
                )}
              >
                <KeyRound className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {isReady && hasApiKey ? "API key saved" : "Add API key"}
                </span>
              </button>
              {onOpenChat && (
                <button
                  onClick={onOpenChat}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-text-secondary transition-colors hover:bg-surface-muted/30 hover:text-text-primary"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Ask</span>
                </button>
              )}
              <div className="flex items-center gap-2 text-[11px]">
                {oversightStatus === "active" ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent/70" />
                    </span>
                    <span className="hidden text-accent/80 sm:inline">
                      {pendingDecisions} decision{pendingDecisions === 1 ? "" : "s"} pending
                    </span>
                  </>
                ) : (
                  <>
                    <SnowflakeLogoIcon size={14} className="opacity-70" />
                    <span className="hidden text-[11px] text-text-faint sm:inline">In sync</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-[12px]">
            {dealHealth && (
              <span
                className={`font-medium ${
                  dealHealth.status === "healthy"
                    ? "text-emerald-400/90"
                    : dealHealth.status === "attention"
                      ? "text-accent/90"
                      : "text-rose-400/90"
                }`}
                title={dealHealth.reason}
              >
                {dealHealth.label}
              </span>
            )}
            <span className="text-text-muted">
              Built using public information only. Internal account details, consumption, opportunities, and competitive footprint must be validated post-onboarding.
            </span>
            <span className="text-text-muted">{signalCount > 0 ? `${signalCount} public signals tracked` : "Public signal workflow active"}</span>
          </div>
        </div>
      </header>

      {isApiKeyOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 px-4 py-10 sm:py-24">
          <div className="w-full max-w-md rounded-xl border border-surface-border/50 bg-surface-elevated shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border/40 px-5 py-4">
              <div className="flex items-center gap-3">
                <SnowflakeLogoIcon size={24} className="shrink-0 opacity-90" />
                <div>
                  <p className="text-[13px] font-medium text-text-primary">API Key</p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    Add your API key to enable chat and content generation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApiKeyOpen(false)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted/40 hover:text-text-secondary transition-colors"
                aria-label="Close API key dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="space-y-2">
                <label htmlFor="api-key-input" className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                  API Key
                </label>
                <input
                  id="api-key-input"
                  type="password"
                  value={draftApiKey}
                  onChange={(e) => setDraftApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full rounded-lg border border-surface-border/50 bg-surface px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted/60 focus:border-accent/30 focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-surface/60 px-3 py-2 text-[11px] text-text-secondary">
                {hasApiKey
                  ? "An API key is saved for this browser."
                  : "Add an API key to enable chat and content generation."}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    clearApiKey();
                    setDraftApiKey("");
                  }}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-text-muted hover:bg-surface-muted/30 hover:text-text-secondary transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear saved key
                </button>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsApiKeyOpen(false)}
                    className="rounded-md px-3 py-2 text-[11px] text-text-secondary hover:bg-surface-muted/30 hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApiKey(draftApiKey);
                      setIsApiKeyOpen(false);
                    }}
                    disabled={!draftApiKey.trim()}
                    className={cn(
                      "rounded-md px-3 py-2 text-[11px] font-medium transition-colors",
                      draftApiKey.trim()
                        ? "bg-accent/90 text-white hover:bg-accent"
                        : "bg-surface-muted/50 text-text-muted"
                    )}
                  >
                    Save key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
