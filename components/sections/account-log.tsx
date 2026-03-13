"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";
import { useToast } from "@/app/context/toast-context";
import { isStaleUpdate } from "@/lib/deal-health";
import type { AccountUpdate } from "@/types";

interface AccountLogProps {
  accountUpdates: AccountUpdate[];
  onAddAccountUpdate: (
    title: string,
    note: string,
    tag: AccountUpdate["tag"]
  ) => void;
}

export function AccountLog({
  accountUpdates,
  onAddAccountUpdate,
}: AccountLogProps) {
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateNote, setUpdateNote] = useState("");
  const [updateTag, setUpdateTag] = useState<AccountUpdate["tag"]>("internal");
  const { showToast } = useToast();

  const handleAddUpdate = () => {
    onAddAccountUpdate(updateTitle, updateNote, updateTag);
    setUpdateTitle("");
    setUpdateNote("");
    setUpdateTag("internal");
    showToast("Update added");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-10 sm:space-y-12"
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-4 p-0">
          <SectionHeader
            title="Account log"
            subtitle="The place the AE tracks what happened, what changed, what slipped, and what to do next."
          />
          <div className="space-y-4">
            {accountUpdates.map((update) => (
              <div
                key={update.id}
                id={`account-update-${update.id}`}
                className="rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-text-secondary">
                    {update.tag.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-text-faint">
                    {update.createdAt} · {update.author}
                  </span>
                  {isStaleUpdate(update.createdAt) && (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400/95">
                      Stale
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[14px] font-medium text-text-primary">
                  {update.title}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  {update.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-[28px] border border-white/8 bg-white/[0.03] p-4 sm:p-6">
          <SectionHeader
            title="Update the account"
            subtitle="Drop in a real note the way a top AE would after a call, internal review, or competitive development."
          />
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Update title
              </label>
              <input
                value={updateTitle}
                onChange={(event) => setUpdateTitle(event.target.value)}
                placeholder="e.g. Security team asked for a cleaner deployment story"
                className="w-full rounded-[18px] border border-surface-border/40 bg-surface-muted/20 px-4 py-3 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Update type
              </label>
              <div className="flex flex-wrap gap-2">
                {(["call", "internal", "risk", "next_step", "exec"] as const).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setUpdateTag(tag)}
                    className={`touch-target min-h-[44px] rounded-full border px-4 py-2.5 text-[12px] transition-colors ${
                      updateTag === tag
                        ? "border-claude-coral/20 bg-claude-coral/[0.10] text-claude-coral"
                        : "border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/[0.06] active:bg-white/[0.06]"
                    }`}
                  >
                    {tag.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Notes
              </label>
              <textarea
                value={updateNote}
                onChange={(event) => setUpdateNote(event.target.value)}
                rows={6}
                placeholder="What happened, what it means, and what you need to do next..."
                className="w-full resize-none rounded-[22px] border border-surface-border/40 bg-surface-muted/20 px-4 py-3 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddUpdate}
              disabled={!updateTitle.trim() || !updateNote.trim()}
              className="touch-target w-full min-h-[44px] rounded-full border border-claude-coral/20 bg-claude-coral/[0.10] px-4 py-3 text-[13px] font-medium text-claude-coral disabled:opacity-50 sm:w-fit sm:py-2"
            >
              Add account update
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
