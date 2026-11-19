'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="font-display text-2xl font-bold text-fg">
        Something went wrong
      </h1>
      <p className="text-xs text-muted">
        {error?.message || 'An unexpected error occurred while rendering this page.'}
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="glass-pill rounded-full px-5 py-2 text-xs font-semibold text-fg"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
