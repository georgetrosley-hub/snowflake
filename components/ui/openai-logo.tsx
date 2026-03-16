"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface OpenAILogoProps {
  className?: string;
  size?: number;
}

const LOGO_PATH = "/openai-logo.png";

/** Official OpenAI logo (black/white knot) — favicon, sidebar, headers */
export function OpenAILogoImage({ className, size = 20 }: OpenAILogoProps) {
  return (
    <Image
      src={LOGO_PATH}
      alt="OpenAI"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority
      unoptimized
    />
  );
}

/** SVG fallback for small or colored contexts */
export function OpenAILogo({ className, size = 20 }: OpenAILogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-accent", className)}
      aria-hidden
    >
      <path
        d="M12 2L14 8L20 9L15 12L16 18L12 15L8 18L9 12L4 9L10 8L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Compact "ChatGPT" wordmark-style icon: chat bubble + sparkle */
export function ChatGPTIcon({ className, size = 20 }: OpenAILogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-accent", className)}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6l-2 2V4zm4 4h8v1.5H8V8zm0 3h8v1.5H8V11zm0 3h5v1.5H8V14z"
        fill="currentColor"
      />
      <path
        d="M18 6.5a1 1 0 11-2 0 1 1 0 012 0z"
        fill="currentColor"
      />
    </svg>
  );
}
