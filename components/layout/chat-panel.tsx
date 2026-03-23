"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Square, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useApiKey } from "@/app/context/api-key-context";
import { cn } from "@/lib/utils";
import { readApiErrorMessage } from "@/lib/client/api";
import { SnowflakeLogoIcon } from "@/components/ui/snowflake-logo";
import type { Account, Competitor } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  competitors: Competitor[];
  activeSection: string;
  /** When set, opens Strategy with this user message and streams the reply (POV Plan, etc.) */
  pendingUserMessage?: string | null;
  onPendingUserMessageConsumed?: () => void;
}

export function ChatPanel({
  isOpen,
  onClose,
  account,
  competitors,
  activeSection,
  pendingUserMessage,
  onPendingUserMessageConsumed,
}: ChatPanelProps) {
  const { hasApiKey, getRequestHeaders } = useApiKey();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const streamReply = useCallback(
    async (newMessages: Message[]) => {
      if (isStreaming) return;

      setMessages(newMessages);
      setIsStreaming(true);
      setStreamingContent("");

      const controller = new AbortController();
      abortRef.current = controller;
      let fullText = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getRequestHeaders(),
          },
          body: JSON.stringify({
            messages: newMessages,
            account,
            competitors,
            section: activeSection,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await readApiErrorMessage(response));
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setStreamingContent(fullText);
                }
              } catch {
                // skip
              }
            }
          }
        }

        setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
        setStreamingContent("");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                error instanceof Error
                  ? error.message
                  : "Add API key to enable Strategy.",
            },
          ]);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, account, competitors, activeSection, getRequestHeaders]
  );

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setInput("");
    await streamReply(newMessages);
  }, [input, messages, isStreaming, streamReply]);

  useEffect(() => {
    if (!isOpen || !pendingUserMessage?.trim()) return;
    const content = pendingUserMessage.trim();
    onPendingUserMessageConsumed?.();
    setMessages((prev) => {
      const next = [...prev, { role: "user" as const, content }];
      queueMicrotask(() => {
        void streamReply(next);
      });
      return next;
    });
  }, [isOpen, pendingUserMessage, onPendingUserMessageConsumed, streamReply]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    if (streamingContent) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: streamingContent },
      ]);
      setStreamingContent("");
    }
    setIsStreaming(false);
  }, [streamingContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const assistantMarkdownComponents = {
    h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
      <h1 className="mt-2 text-[14px] font-semibold text-text-primary" {...props} />
    ),
    h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
      <h2 className="mt-2 text-[13px] font-semibold text-text-primary" {...props} />
    ),
    h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
      <h3 className="mt-2 text-[13px] font-medium text-text-primary" {...props} />
    ),
    p: (props: React.ComponentPropsWithoutRef<"p">) => (
      <p className="mt-1.5 first:mt-0 text-[13px] leading-relaxed text-text-secondary" {...props} />
    ),
    strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
      <strong className="font-semibold text-text-primary" {...props} />
    ),
    ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
      <ul className="mt-1.5 list-disc space-y-1 pl-4" {...props} />
    ),
    ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
      <ol className="mt-1.5 list-decimal space-y-1 pl-4" {...props} />
    ),
    li: (props: React.ComponentPropsWithoutRef<"li">) => (
      <li className="text-[13px] leading-relaxed text-text-secondary" {...props} />
    ),
    a: (props: React.ComponentPropsWithoutRef<"a">) => (
      <a
        {...props}
        target="_blank"
        rel="noreferrer"
        className="text-accent/90 underline decoration-accent/40 underline-offset-2 hover:text-accent"
      />
    ),
    code: (props: React.ComponentPropsWithoutRef<"code">) => (
      <code className="rounded bg-surface-muted/50 px-1 py-0.5 text-[12px] text-text-primary" {...props} />
    ),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 sm:bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-surface shadow-2xl sm:max-w-[480px] sm:border-l sm:border-surface-border/40 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          >
            {/* Header */}
            <div className="flex min-h-12 shrink-0 items-center justify-between border-b border-surface-border/40 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <SnowflakeLogoIcon size={20} />
                <span className="truncate text-[13px] font-medium text-text-primary">
                  Strategy
                </span>
                <span className="hidden rounded-full bg-surface-muted/60 px-2 py-0.5 text-[10px] text-text-muted sm:inline-flex">
                  {account.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      setMessages([]);
                      setStreamingContent("");
                    }}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted/40 hover:text-text-secondary transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted/40 hover:text-text-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && !streamingContent && (
                <div className="flex h-full flex-col items-center justify-center px-4 text-center sm:px-8">
                  <SnowflakeLogoIcon
                    size={32}
                    className="mb-4 opacity-90"
                  />
                  <p className="text-[15px] font-semibold text-text-primary mb-1">
                    Strategy
                  </p>
                  <p className="text-[13px] text-text-muted leading-relaxed mb-6">
                    {account.id === "na"
                      ? "Account-specific discovery, POV, and expansion plays."
                      : `Strategy for ${account.name}. Discovery, POV, expansion.`}
                  </p>
                  {!hasApiKey && (
                    <div className="mb-6 rounded-lg border border-accent/20 bg-accent/[0.06] px-3 py-2 text-[11px] text-accent/90">
                      Add API key to enable Strategy.
                    </div>
                  )}
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-faint mb-2">
                    Suggested prompts:
                  </p>
                  <div className="space-y-2 w-full">
                    {[
                      `Land strategy for ${account.name}`,
                      `Champion map for ${account.name}`,
                      "Legal and security objections",
                      "Fastest pilot path",
                      "Procurement and governance path",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        className="w-full rounded-lg border border-surface-border/40 bg-surface-elevated/30 px-3 py-2.5 text-left text-[12px] text-text-muted hover:border-accent/20 hover:text-text-secondary transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md">
                      <SnowflakeLogoIcon size={20} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2.5 text-[13px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-accent/10 text-text-primary"
                        : "bg-surface-elevated/60 text-text-secondary"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="min-w-0">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={assistantMarkdownComponents}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {isStreaming && streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10">
                    <SnowflakeLogoIcon
                      size={20}
                      className="animate-pulse opacity-90"
                    />
                  </div>
                  <div className="max-w-[85%] rounded-lg bg-surface-elevated/60 px-3 py-2.5 text-[13px] leading-relaxed text-text-secondary">
                    <div className="min-w-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={assistantMarkdownComponents}
                      >
                        {streamingContent}
                      </ReactMarkdown>
                      <span className="inline-block h-4 w-1.5 animate-pulse align-text-bottom bg-accent/50 ml-0.5" />
                    </div>
                  </div>
                </div>
              )}

              {isStreaming && !streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10">
                    <SnowflakeLogoIcon
                      size={20}
                      className="animate-pulse opacity-90"
                    />
                  </div>
                  <div className="rounded-lg bg-surface-elevated/60 px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-surface-border/40 px-4 pb-6 pt-4 sm:p-4">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Strategy for ${account.name}...`}
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-surface-border/50 bg-surface-elevated/40 px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted/60 focus:border-accent/30 focus:outline-none focus:ring-0 transition-colors"
                  style={{
                    maxHeight: "120px",
                    minHeight: "40px",
                    height: "auto",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  }}
                />
                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted/60 text-text-muted hover:bg-surface-muted transition-colors"
                  >
                    <Square className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                      input.trim()
                        ? "bg-accent/90 text-white hover:bg-accent"
                        : "bg-surface-muted/40 text-text-muted/40"
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
