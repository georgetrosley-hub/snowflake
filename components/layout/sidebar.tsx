"use client";

import { cn } from "@/lib/utils";
import { AnthropicMark } from "@/components/layout/anthropic-mark";
import {
  LayoutDashboard,
  Activity,
  Network,
  Crosshair,
  Shield,
  Calendar,
  CheckSquare,
  FileText,
} from "lucide-react";

const sections = [
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "feed", label: "Agent Activity", icon: Activity },
  { id: "approval", label: "Approval Queue", icon: CheckSquare },
  { id: "competitive", label: "Competitive Landscape", icon: Crosshair },
  { id: "architecture", label: "Architecture", icon: Shield },
  { id: "org", label: "Org Expansion Map", icon: Network },
  { id: "timeline", label: "Deal Timeline", icon: Calendar },
  { id: "narrative", label: "Executive Narrative", icon: FileText },
] as const;

export type SectionId = (typeof sections)[number]["id"];

interface SidebarProps {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="relative flex w-56 shrink-0 flex-col border-r border-surface-border/70 bg-surface-elevated/70 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent/10 to-transparent" />
      <div className="relative border-b border-surface-border/60 px-5 py-5">
        <AnthropicMark subtitle="Claude Revenue Systems" />
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-all duration-200",
              activeSection === id
                ? "bg-accent/12 text-text-primary shadow-[inset_0_0_0_1px_rgba(196,181,154,0.18)]"
                : "text-text-muted hover:bg-surface-muted/55 hover:text-text-secondary"
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                activeSection === id ? "opacity-90" : "opacity-60"
              )}
            />
            {label}
          </button>
        ))}
      </nav>
      <div className="border-t border-surface-border/60 px-5 py-4">
        <p className="text-[12px] text-text-secondary">George Trosley</p>
        <p className="text-[11px] text-text-muted">Enterprise GTM</p>
      </div>
    </aside>
  );
}
