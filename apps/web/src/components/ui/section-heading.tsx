import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  /** Optional legacy prop; omitted visually by default to keep headings clean without eyebrow clutter. */
  eyebrow?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function SectionHeading({
  title,
  description,
  actionHref,
  actionLabel,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
      <div className="space-y-1.5 max-w-2xl">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-fg tracking-[-0.025em]">
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline shrink-0"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
