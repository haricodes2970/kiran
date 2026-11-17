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
      <h1 className="text-2xl font-bold text-slate-900">
        Something went wrong
      </h1>
      <p className="text-xs text-slate-500">
        {error?.message || 'An unexpected error occurred while rendering this page.'}
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
