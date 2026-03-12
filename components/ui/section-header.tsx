"use client";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <header className="mb-10 border-b border-surface-divider/70 pb-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-faint">
        Anthropic Revenue Intelligence
      </p>
      <h2 className="mt-3 text-[16px] font-medium tracking-tight text-text-primary">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">{subtitle}</p>
      )}
    </header>
  );
}
